import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { callAI } from '@/lib/ai';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const resumeId = searchParams.get('resumeId');
    const customQuery = searchParams.get('query');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;

    let skills = '';
    let contextTitle = '';

    // 1. Determine Search Intent
    if (customQuery) {
        // User provided a manual query
        skills = customQuery;
        contextTitle = customQuery;
    } else {
        // Use a resume for context
        const resume = resumeId 
            ? await prisma.resume.findUnique({ where: { id: resumeId, userId } })
            : await prisma.resume.findFirst({ where: { userId }, orderBy: { updatedAt: 'desc' } });

        if (!resume) {
            return NextResponse.json({ error: 'No resume found.' }, { status: 404 });
        }

        contextTitle = (resume as any).title || 'Main Resume';

        // Extract skills/keywords via AI if using a resume
        const extractionPrompt = `
            Analyze the following resume content and extract the top 3 core technical skills and the primary target job title.
            Return ONLY a comma-separated list of these keywords. 
            Example: "React, Node.js, TypeScript, Full Stack Developer"
            
            Resume Content:
            ${resume.markdown || JSON.stringify(resume.data).substring(0, 3000)}
        `;

        try {
            const aiResponse = await callAI({
                messages: [{ role: 'system', content: 'You are a career expert.' }, { role: 'user', content: extractionPrompt }],
                temperature: 0.1
            });
            skills = aiResponse.content.replace(/["']/g, '');
        } catch (err) {
            console.error('AI Extraction Error:', err);
            skills = (resume as any).title || 'Software Engineer';
        }
    }

    // 2. AGENTIC QUERY GENERATION
    const queryGenPrompt = `
        Based on these keywords: "${skills}", generate 4 distinct job search queries to find the best matching "live" jobs on the web.
        Target these specific vectors:
        1. Specialized tech job boards
        2. Direct company career portals
        3. Professional networks (LinkedIn, Glassdoor)
        4. General aggregators (Indeed, Monster)

        Return ONLY a JSON array of 4 strings. No other text.
    `;

    let searchQueries = [];
    try {
        const aiResponse = await callAI({
            messages: [{ role: 'system', content: 'You are a career search strategist. Output only JSON.' }, { role: 'user', content: queryGenPrompt }],
            temperature: 0.1
        });
        searchQueries = JSON.parse(aiResponse.content.replace(/```json|```/g, ''));
    } catch (err) {
        console.error('Query Gen Error:', err);
        searchQueries = [`${skills} jobs in India`];
    }

    const tavilyKey = process.env.TAVILY_API_KEY;
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    let allJobs: any[] = [];
    let searchStatus = 'partial';

    // 3. PARALLEL AGENTIC SEARCH (Tavily Multi-Vector)
    if (tavilyKey) {
        try {
            const searchPromises = searchQueries.map((q: string) => 
                fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: tavilyKey,
                        query: q + " apply link in india",
                        search_depth: 'advanced',
                        max_results: 5
                    })
                }).then(r => r.ok ? r.json() : { results: [] })
            );

            const allResults = await Promise.all(searchPromises);
            const combinedWebResults = allResults.flatMap(r => r.results);

            // 4. NEURAL SYNTHESIS - Aggressively limit data size to prevent truncation
            const manageableResults = combinedWebResults.slice(0, 12).map(r => ({
                title: r.title,
                url: r.url,
                snippet: r.content.substring(0, 300) // Limit individual snippet size
            }));

            const synthesisPrompt = `
                You are a "Neural Job Harvester". 
                Synthesize this raw web metadata into a clean, unique list of job postings for: "${skills}".
                
                Raw Data: ${JSON.stringify(manageableResults)}

                Requirements:
                - Merge duplicates.
                - Max 8-10 high-quality results.
                - Schema: { id, title, company, location, description, url, salary, created, category: "Neural Crawler" }
                - Return ONLY the JSON array.
            `;

            const synthResponse = await callAI({
                messages: [{ role: 'system', content: 'You are a JSON synthesis engine.' }, { role: 'user', content: synthesisPrompt }],
                temperature: 0.1
            });

            try {
                let cleanJson = synthResponse.content.trim();
                
                // Extremely robust JSON extraction: find the first '[' and last ']'
                const firstBracket = cleanJson.indexOf('[');
                const lastBracket = cleanJson.lastIndexOf(']');
                
                if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                    cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
                }

                const synthesizedJobs = JSON.parse(cleanJson);
                const uniqueSynthesized = synthesizedJobs.map((j: any, idx: number) => ({
                    ...j,
                    id: `neural-${page}-${idx}-${Math.random().toString(36).substring(2, 7)}`
                }));
                allJobs = [...allJobs, ...uniqueSynthesized];
                searchStatus = 'global';
            } catch (se) {
                console.error('Synthesis Error:', se);
                allJobs = combinedWebResults.slice(0, 10).map((r, i) => ({
                    id: `web-${i}-${Date.now()}`,
                    title: r.title,
                    company: "Verified Web Source",
                    location: "India/Remote",
                    description: r.content.substring(0, 150) + "...",
                    url: r.url,
                    salary: "Competitive",
                    created: new Date().toISOString(),
                    category: "Web Crawler"
                }));
            }
        } catch (te) {
            console.error('Tavily Deep Scan Error:', te);
        }
    }

    // 5. ADZUNA SUPPLEMENT
    if (appId && appKey && appId !== 'TODO_GET_APP_ID' && allJobs.length < 20) {
        try {
            const country = 'in'; 
            const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=15&what=${encodeURIComponent(skills)}`;
            const res = await fetch(adzunaUrl);
            if (res.ok) {
                const data = await res.json();
                const adzunaJobs = (data.results || []).map((job: any) => ({
                    id: `adz-${job.id}-${page}`,
                    title: job.title,
                    company: job.company?.display_name || 'Hidden Company',
                    location: job.location?.display_name || 'Remote / Flexible',
                    description: job.description?.substring(0, 200) + '...',
                    url: job.redirect_url,
                    salary: job.salary_min ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}` : 'Competitive',
                    created: job.created,
                    category: 'Adzuna'
                }));

                const existingTitles = new Set(allJobs.map((j: any) => j.title.toLowerCase()));
                const uniqueAdzuna = adzunaJobs.filter((j: any) => !existingTitles.has(j.title.toLowerCase()));
                allJobs = [...allJobs, ...uniqueAdzuna];
            }
        } catch (ae) {
            console.error('Adzuna Supplement Error:', ae);
        }
    }

    return NextResponse.json({ 
        jobs: allJobs, 
        query: skills,
        context: contextTitle,
        total: allJobs.length,
        status: searchStatus
    });
}
