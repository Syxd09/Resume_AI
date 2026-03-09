'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import ResumeForm from '@/components/ResumeForm';

const ResumePreview = dynamic(() => import('@/components/ResumePreview'), {
  loading: () => <div className="flex h-full min-h-[500px] items-center justify-center bg-card rounded-2xl border border-dashed"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" /> <span className="text-muted-foreground text-sm font-medium uppercase tracking-widest font-heading">Initializing Orbital Preview...</span></div>,
  ssr: false
});
import { ResumeData } from '@/types/resume';
import { useResumeStore } from '@/store/useResumeStore';
import { AlertCircle, Loader2 } from 'lucide-react';

function BuilderContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumeMarkdown, setResumeMarkdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastJD = useRef<string>('');
  
  const resumeId = searchParams?.get('id');

  // Load existing resume data if ID is present
  useEffect(() => {
    if (status === 'authenticated' && resumeId) {
      const fetchResume = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/resumes?id=${resumeId}`);
          if (res.ok) {
            const responseData = await res.json();
            if (responseData.resume) {
              const { data, id, markdown } = responseData.resume;
              useResumeStore.getState().setResumeData(data);
              useResumeStore.getState().setCurrentResumeId(id);
              if (markdown) setResumeMarkdown(markdown);
              else setResumeMarkdown('Loaded'); // Trigger preview even if no markdown yet
            }
          }
        } catch (err) {
          console.error("Failed to fetch resume:", err);
          setError("Failed to load existing resume data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchResume();
    }
  }, [resumeId, status]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const handleGenerateResume = async (data: ResumeData) => {
    setIsLoading(true);
    setError(null);
    setResumeMarkdown(null);
    lastJD.current = data.jobDescription || '';

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || `HTTP error! status: ${response.status}`);
      }

      // The new API returns perfectly tailored JSON ResumeData
      if (responseData.data) {
        useResumeStore.getState().setResumeData(responseData.data);
      }
      if (responseData.resumeId) {
        useResumeStore.getState().setCurrentResumeId(responseData.resumeId);
      }
      
      setResumeMarkdown('# Generated'); // Set a truthy value to trigger the preview pane

      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      console.error('Failed to generate resume:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasResume = resumeMarkdown !== null;

  return (
    <div className="flex-1 px-6 py-12 md:px-12 max-w-[1800px] mx-auto w-full relative z-10 transition-all duration-700">
      {/* Cinematic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[1px] w-8 bg-primary/50" />
            <span className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-primary/60">System Module: B-01</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] flex items-center gap-6 text-white italic uppercase leading-[0.85] text-glow font-heading">
            OBSERVATORY <span className="text-primary not-italic tracking-tighter">CONTROL</span>
          </h1>
          <div className="flex items-center gap-4">
             <div className="h-[2px] w-16 bg-gradient-to-r from-primary/80 to-transparent" />
             <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[0.65rem]">Neural Mapping Engine • {session?.user?.name?.split(' ')[0]} Access Active</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="px-6 py-3 bg-white/5 rounded-full border border-white/5 backdrop-blur-md flex items-center gap-4 transition-all hover:border-white/10 group">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Telemetry: Online</span>
           </div>
           <div className="px-6 py-3 bg-white/5 rounded-full border border-white/5 backdrop-blur-md flex items-center gap-4 transition-all hover:border-white/10 group">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[0.55rem] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">Neural Load: Optimal</span>
           </div>
        </div>
      </div>

      <div className="w-full relative">
        {/* Subtle grid background for the control panel area */}
        <div className="absolute -inset-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
        
        {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg max-w-3xl mx-auto mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-destructive hover:opacity-70">&times;</button>
        </div>
      )}

        <main className={`grid gap-10 md:gap-12 items-start transition-all duration-700 ease-in-out ${hasResume ? 'grid-cols-1 xl:grid-cols-12 w-full' : 'grid-cols-1 max-w-5xl mx-auto'}`}>
          <div className={`${hasResume ? 'xl:col-span-5' : ''} order-1 rounded-[3rem] border border-white/5 orbital-glass shadow-2xl relative overflow-hidden group`}>
            {/* Inner scanning line effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-glint pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <ResumeForm onSubmit={handleGenerateResume} isLoading={isLoading} />
          </div>
          
          <div id="preview-section" className={`${hasResume ? 'xl:col-span-7 lg:sticky lg:top-24 block' : 'hidden'} order-2 transition-all duration-700 transform translate-y-0`}>
            <div className="rounded-[3rem] border border-white/5 orbital-glass overflow-hidden shadow-[-40px_60px_100px_rgba(0,0,0,0.5)] bg-black/20">
              <ResumePreview
                resumeMarkdown={resumeMarkdown || ''}
                onResumeChange={setResumeMarkdown}
                onReset={() => setResumeMarkdown(null)}
                jobDescription={lastJD.current}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}
