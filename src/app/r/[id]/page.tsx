export const dynamic = 'force-dynamic';
import { getAdminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import { ProfessionalTemplate } from '@/components/templates/ProfessionalTemplate';
import { ModernTemplate } from '@/components/templates/ModernTemplate';
import { MinimalTemplate } from '@/components/templates/MinimalTemplate';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const resumeDoc = await db.collection('resumes').doc(id).get();
    
    if (!resumeDoc.exists) return { title: 'Resume Not Found' };
    const resume = resumeDoc.data();
    
    return {
      title: resume ? `${resume.title} — SATURN AI` : 'Resume Not Found',
      description: resume ? `View ${resume.title} on SATURN AI` : 'This resume could not be found.',
    };
  } catch (err) {
    return { title: 'Resume Not Found' };
  }
}

function RenderResume({ data, markdown }: { data: any; markdown: string | null }) {
  if (data && typeof data === 'object' && data.personalInfo) {
    const template = data.template || 'professional';
    switch (template) {
      case 'modern': return <ModernTemplate data={data} />;
      case 'minimal': return <MinimalTemplate data={data} />;
      default: return <ProfessionalTemplate data={data} />;
    }
  }
  if (markdown) {
    return <ReactMarkdown>{markdown}</ReactMarkdown>;
  }
  return <p className="text-zinc-400">This resume could not be rendered.</p>;
}

export default async function PublicResumePage({ params }: Props) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    
    const resumeDoc = await db.collection('resumes').doc(id).get();
    if (!resumeDoc.exists) notFound();

    const resumeData = resumeDoc.data()!;
    
    // Fetch user name
    let userName = 'Anonymous';
    if (resumeData.userId) {
        const userDoc = await db.collection('users').doc(resumeData.userId).get();
        if (userDoc.exists) {
            userName = userDoc.data()?.name || 'Anonymous';
        }
    }

    if (!resumeData.markdown && !resumeData.data) {
        notFound();
    }

    return (
        <div className="public-resume-page">
          <div className="public-resume-header">
            <h1>{resumeData.title}</h1>
            <p className="text-zinc-400">
              {`By ${userName}`} ·{' '}
              {new Date(resumeData.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="public-resume-body glass-panel">
            <RenderResume data={resumeData.data} markdown={resumeData.markdown} />
          </div>
          <div className="public-resume-footer">
            <p className="text-zinc-500">
              Generated with ✨{' '}
              <a href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                SATURN AI
              </a>
            </p>
          </div>
        </div>
    );
  } catch (err) {
      console.error('Error rendering shared resume:', err);
      notFound();
  }
}
