import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runATSAnalysis } from '@/lib/ats-engine';

interface BulletIssue {
    experienceId: string;
    bulletIndex: number;
    bullet: string;
    issues: string[];
}

interface SectionCheck {
    name: string;
    status: 'pass' | 'warn' | 'fail';
    detail: string;
    fixable: boolean;
    fixType?: string;
}

/**
 * POST /api/resume-review
 * 
 * Enhanced readiness check: runs ATS engine + detailed per-item analysis.
 * Returns projected score, component breakdowns, section-by-section audit,
 * per-bullet analysis, and auto-fixable issue identifiers.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { personal, summary, targetRole, jobDescription, skills, experience, projects, education, certifications, languages } = await req.json();

        // ── Convert structured data to text for ATS engine ──
        const lines: string[] = [];
        if (personal) {
            if (personal.fullName) lines.push(personal.fullName);
            const parts = [personal.location, personal.phone, personal.email, personal.linkedin, personal.github, personal.portfolio].filter(Boolean);
            if (parts.length > 0) lines.push(parts.join(' | '));
        }
        if (summary) lines.push('', 'Professional Summary', summary);
        const skillsList = Array.isArray(skills) ? skills.filter(Boolean) : [];
        if (skillsList.length > 0) lines.push('', 'Skills', skillsList.join(', '));
        const expList = Array.isArray(experience) ? experience : [];
        if (expList.length > 0) {
            lines.push('', 'Professional Experience');
            for (const exp of expList) {
                lines.push(`${exp.jobTitle || ''} at ${exp.company || ''}`);
                if (exp.startDate || exp.endDate) lines.push(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`);
                if (exp.location) lines.push(exp.location);
                if (Array.isArray(exp.bullets)) {
                    for (const b of exp.bullets) {
                        if (b && b.trim()) lines.push(`- ${b.trim()}`);
                    }
                }
            }
        }
        const projList = Array.isArray(projects) ? projects : [];
        if (projList.length > 0) {
            lines.push('', 'Projects');
            for (const proj of projList) {
                lines.push(`${proj.name || 'Project'}${proj.techStack ? ' (' + proj.techStack + ')' : ''}`);
                if (proj.description) lines.push(proj.description);
            }
        }
        const eduList = Array.isArray(education) ? education : [];
        if (eduList.length > 0) {
            lines.push('', 'Education');
            for (const edu of eduList) {
                lines.push(`${edu.degree || ''}, ${edu.institution || ''}, ${edu.year || ''}`);
                if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
            }
        }
        const certsList = Array.isArray(certifications) ? certifications.filter(Boolean) : [];
        if (certsList.length > 0) lines.push('', 'Certifications', certsList.join(', '));
        const langList = Array.isArray(languages) ? languages.filter(Boolean) : [];
        if (langList.length > 0) lines.push('', 'Languages', langList.join(', '));

        const resumeText = lines.join('\n');

        // Build a rich fallback JD from the user's own data when no JD is provided.
        // Without this, the keyword matcher finds zero keywords in a generic sentence.
        let jdText = jobDescription || '';
        if (!jdText.trim()) {
            const jdParts: string[] = [];
            jdParts.push(`We are looking for a ${targetRole || 'professional'}.`);
            if (skillsList.length > 0) {
                jdParts.push(`Required skills: ${skillsList.join(', ')}.`);
            }
            // Pull job titles and tech from experience
            for (const exp of expList) {
                if (exp.jobTitle) jdParts.push(`Experience as ${exp.jobTitle}.`);
                if (Array.isArray(exp.bullets)) {
                    for (const b of exp.bullets) {
                        if (b?.trim()) jdParts.push(b.trim());
                    }
                }
            }
            // Pull tech from projects
            for (const proj of projList) {
                if (proj.techStack) jdParts.push(`Technologies: ${proj.techStack}.`);
                if (proj.description) jdParts.push(proj.description);
            }
            if (certsList.length > 0) jdParts.push(`Certifications: ${certsList.join(', ')}.`);
            jdParts.push('Strong communication, problem-solving, and teamwork skills required.');
            jdText = jdParts.join(' ');
        }

        // ── Run ATS engine ──
        const result = runATSAnalysis(resumeText, jdText);

        // ── Section-by-section audit ──
        const sectionChecks: SectionCheck[] = [];

        // Contact Info
        const contactFields = [
            { field: 'Name', value: personal?.fullName },
            { field: 'Email', value: personal?.email },
            { field: 'Phone', value: personal?.phone },
            { field: 'Location', value: personal?.location },
        ];
        const contactFilled = contactFields.filter(c => c.value).length;
        const contactMissing = contactFields.filter(c => !c.value).map(c => c.field);
        sectionChecks.push({
            name: 'Contact Information',
            status: contactFilled >= 3 ? 'pass' : contactFilled >= 2 ? 'warn' : 'fail',
            detail: contactFilled >= 3 ? `${contactFilled}/4 fields filled` : `Missing: ${contactMissing.join(', ')}`,
            fixable: false,
        });
        // LinkedIn check
        sectionChecks.push({
            name: 'LinkedIn Profile',
            status: personal?.linkedin ? 'pass' : 'warn',
            detail: personal?.linkedin ? 'LinkedIn URL provided' : 'Adding LinkedIn improves ATS score by ~5%',
            fixable: false,
        });

        // Summary
        const summaryWords = summary ? summary.split(/\s+/).length : 0;
        const summaryHasTargetRole = summary && targetRole ? summary.toLowerCase().includes(targetRole.toLowerCase().split(' ')[0]) : false;
        sectionChecks.push({
            name: 'Professional Summary',
            status: !summary ? 'fail' : summaryWords < 15 ? 'warn' : 'pass',
            detail: !summary
                ? 'No summary — this is the first thing recruiters read'
                : summaryWords < 15
                    ? `Only ${summaryWords} words — aim for 30-60 words`
                    : summaryHasTargetRole
                        ? `${summaryWords} words, includes target role keywords ✓`
                        : `${summaryWords} words — consider mentioning your target role "${targetRole}"`,
            fixable: !summary || summaryWords < 15,
            fixType: 'summary',
        });

        // Skills
        sectionChecks.push({
            name: 'Skills',
            status: skillsList.length >= 8 ? 'pass' : skillsList.length >= 4 ? 'warn' : 'fail',
            detail: skillsList.length === 0
                ? 'No skills listed — add 8-15 relevant skills'
                : skillsList.length < 8
                    ? `${skillsList.length} skills — aim for 8-15 (add tools, methods, soft skills)`
                    : `${skillsList.length} skills listed ✓`,
            fixable: false,
        });

        // Experience
        const totalBullets = expList.reduce((sum: number, e: any) => sum + (Array.isArray(e.bullets) ? e.bullets.filter((b: string) => b?.trim()).length : 0), 0);
        const hasExperience = expList.some((e: any) => e.jobTitle || e.company);
        sectionChecks.push({
            name: 'Work Experience',
            status: !hasExperience ? 'fail' : totalBullets < expList.length * 2 ? 'warn' : 'pass',
            detail: !hasExperience
                ? 'No experience entries — add at least 1 role'
                : totalBullets === 0
                    ? `${expList.length} role(s) but no bullets — add 3-4 bullets per role`
                    : `${expList.length} role(s) with ${totalBullets} bullets`,
            fixable: totalBullets > 0,
            fixType: 'bullets',
        });

        // Projects
        const hasProjects = projList.some((p: any) => p.name);
        const weakProjectDescs = projList.filter((p: any) => !p.description || p.description.length < 20);
        sectionChecks.push({
            name: 'Projects',
            status: !hasProjects ? 'warn' : weakProjectDescs.length > 0 ? 'warn' : 'pass',
            detail: !hasProjects
                ? 'No projects — add 1-2 to showcase your work'
                : weakProjectDescs.length > 0
                    ? `${projList.length} project(s) — ${weakProjectDescs.length} need better descriptions`
                    : `${projList.length} project(s) with descriptions ✓`,
            fixable: hasProjects && weakProjectDescs.length > 0,
            fixType: 'projects',
        });

        // Education
        const hasEducation = eduList.some((e: any) => e.degree || e.institution);
        sectionChecks.push({
            name: 'Education',
            status: hasEducation ? 'pass' : 'fail',
            detail: hasEducation
                ? `${eduList.length} entry/entries ✓`
                : 'No education entries — add your degree',
            fixable: false,
        });

        // Certs & Languages
        sectionChecks.push({
            name: 'Certifications',
            status: certsList.length > 0 ? 'pass' : 'warn',
            detail: certsList.length > 0 ? `${certsList.length} certifications ✓` : 'Optional — certifications boost ATS score',
            fixable: false,
        });

        // ── Per-bullet quality analysis ──
        const bulletIssues: BulletIssue[] = [];
        const weakPhrases = /^(responsible\s+for|worked\s+on|helped\s+(with|to)|assisted\s+(in|with)|was\s+involved|did|handles?|handling|duties\s+included?)/i;
        const actionVerbRe = /^(Developed|Designed|Implemented|Built|Created|Led|Managed|Spearheaded|Launched|Optimized|Analyzed|Delivered|Achieved|Increased|Reduced|Streamlined|Coordinated|Executed|Pioneered|Established|Collaborated|Maintained|Processed|Transformed|Revolutionized|Deployed|Configured|Automated|Integrated|Migrated|Resolved|Negotiated|Mentored|Trained|Facilitated|Generated|Prepared|Administered|Supervised|Directed|Architected|Engineered|Composed|Diagnosed|Evaluated|Assessed|Drafted|Verified|Monitored|Investigated|Formulated|Proposed|Presented|Secured|Cultivated|Expanded|Enhanced|Strengthened|Initiated|Restructured|Consolidated)/i;
        const hasMetric = /\d+[%$+KkMm]?|\$\d|percent|\d+\s*(users|customers|clients|projects|teams|employees|students|patients|records|transactions|requests|reports|tickets)/i;

        for (const exp of expList) {
            if (!Array.isArray(exp.bullets)) continue;
            exp.bullets.forEach((bullet: string, idx: number) => {
                if (!bullet?.trim()) return;
                const trimmed = bullet.trim();
                const issues: string[] = [];

                if (weakPhrases.test(trimmed)) {
                    issues.push('Starts with a weak phrase — use an action verb instead');
                } else if (!actionVerbRe.test(trimmed)) {
                    issues.push('Should start with a strong action verb (Developed, Built, Led, etc.)');
                }

                if (!hasMetric.test(trimmed)) {
                    issues.push('No quantified impact — add numbers, %, or dollar amounts');
                }

                if (trimmed.length < 30) {
                    issues.push('Too short — expand with specific details about what you did and the result');
                }

                if (trimmed.length > 200) {
                    issues.push('Too long — keep bullets concise (50-150 characters)');
                }

                if (issues.length > 0) {
                    bulletIssues.push({
                        experienceId: exp.id,
                        bulletIndex: idx,
                        bullet: trimmed.substring(0, 80) + (trimmed.length > 80 ? '...' : ''),
                        issues,
                    });
                }
            });
        }

        // ── Compute bullet quality stats ──
        const allBullets = expList.flatMap((e: any) => Array.isArray(e.bullets) ? e.bullets.filter((b: string) => b?.trim()) : []);
        const bulletStats = {
            total: allBullets.length,
            withActionVerb: allBullets.filter((b: string) => actionVerbRe.test(b.trim())).length,
            withMetrics: allBullets.filter((b: string) => hasMetric.test(b)).length,
            withWeakStart: allBullets.filter((b: string) => weakPhrases.test(b.trim())).length,
            avgLength: allBullets.length > 0 ? Math.round(allBullets.reduce((s: number, b: string) => s + b.trim().length, 0) / allBullets.length) : 0,
        };

        // ── Fixable issues summary ──
        const fixableIssues = sectionChecks.filter(s => s.fixable);
        const hasBulletIssues = bulletIssues.length > 0;
        const canAutoFix = fixableIssues.length > 0 || hasBulletIssues;

        return NextResponse.json({
            projectedScore: result.overallScore,
            keywordScore: result.keywordScore,
            sectionScore: result.sectionScore,
            bulletScore: result.bulletScore,
            readabilityScore: result.readabilityScore,
            formatScore: result.formatScore,
            sectionChecks,
            bulletIssues,
            bulletStats,
            canAutoFix,
            fixableCount: bulletIssues.length + fixableIssues.length,
            isReady: result.overallScore >= 50 && !sectionChecks.some(s => s.status === 'fail'),
        });
    } catch (err) {
        console.error('Resume review error:', err);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
