'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Target, Loader2, Plus, X, TrendingUp,
  CheckCircle2, AlertCircle, Lightbulb, FileText, Clock,
  Upload, File, Zap, Shield, Award, AlertTriangle, ThumbsUp,
  ChevronDown, ChevronRight, ChevronLeft
} from 'lucide-react';

interface AtsScoreItem {
  id: string;
  score: number;
  jdSnippet: string | null;
  matched: string[];
  missing: string[];
  suggestions: string[];
  fullResult?: any;
  createdAt: string;
  resume: { id: string; title: string };
}

interface KeywordDetail {
  keyword: string;
  found: boolean;
  frequency: number;
  category: string;
}

interface DetailedResult {
  // Deterministic component scores
  score: number;
  keywordScore: number;
  sectionScore: number;
  bulletScore: number;
  readabilityScore: number;
  formatScore: number;

  // Keyword analysis
  matched: string[];
  missing: string[];
  keywords?: KeywordDetail[];

  // Section analysis
  sections?: { name: string; detected: boolean; quality: string; feedback: string }[];

  // Bullet analysis
  bulletAnalysis?: {
    totalBullets: number;
    actionVerbBullets: number;
    quantifiedBullets: number;
    avgBulletLength: number;
    actionVerbs: string[];
    metrics: string[];
  };

  // Format & readability
  readabilityMetrics?: { avgSentenceLength: number; totalWords: number; hasSpecialChars: boolean; hasTablesOrImages: boolean };
  formatMetrics?: { hasDates: boolean; dateConsistency: boolean; hasProperLength: boolean; wordCount: number; estimatedPages: number };

  // AI qualitative
  overallVerdict?: string;
  suggestions?: string[];
  strengthAreas?: string[];
  formatIssues?: string[];
  sectionFeedback?: Record<string, string>;
}

interface ResumeOption {
  id: string;
  title: string;
}

export default function AtsTrackerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [scores, setScores] = useState<AtsScoreItem[]>([]);
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // New analysis modal
  const [showModal, setShowModal] = useState(false);
  const [inputMode, setInputMode] = useState<'select' | 'upload'>('select');
  const [selectedResume, setSelectedResume] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jd, setJd] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail view
  const [viewingScore, setViewingScore] = useState<AtsScoreItem | null>(null);
  const [detailedResult, setDetailedResult] = useState<DetailedResult | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated') fetchData();
  }, [status, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ats-tracker');
      if (res.ok) {
        const data = await res.json();
        setScores(data.scores || []);
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.parsed) {
        // Convert parsed JSON to readable text
        setUploadedText(JSON.stringify(data.parsed));
      } else {
        // Try plain text read
        const text = await file.text();
        if (text.trim().length > 20) {
          setUploadedText(text);
        } else {
          alert(data.error || 'Could not parse file.');
          setUploadedFileName('');
        }
      }
    } catch {
      alert('Error uploading file.');
      setUploadedFileName('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    const hasResume = inputMode === 'select' ? selectedResume : uploadedText.trim();
    if (!hasResume || !jd.trim()) return;
    setAnalyzing(true);
    try {
      const body: any = { jobDescription: jd };
      if (inputMode === 'select') {
        body.resumeId = selectedResume;
      } else {
        body.resumeText = uploadedText;
      }

      const res = await fetch('/api/ats-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.score) {
        setShowModal(false);
        setJd('');
        setSelectedResume('');
        setUploadedText('');
        setUploadedFileName('');
        fetchData();
        // Auto-open the result
        setViewingScore(data.score);
        setDetailedResult(data.result || null);
      } else {
        alert(data.error || 'Analysis failed.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const getSectionIcon = (key: string) => {
    const icons: Record<string, React.ReactNode> = {
      contactInfo: <FileText size={14} />,
      summary: <Zap size={14} />,
      experience: <Award size={14} />,
      skills: <Shield size={14} />,
      education: <FileText size={14} />,
      projects: <Target size={14} />,
      formatting: <BarChart3 size={14} />,
    };
    return icons[key] || <FileText size={14} />;
  };

  const getSectionLabel = (key: string) => {
    const labels: Record<string, string> = {
      contactInfo: 'Contact Info',
      summary: 'Summary',
      experience: 'Experience',
      skills: 'Skills',
      education: 'Education',
      projects: 'Projects',
      formatting: 'Formatting',
    };
    return labels[key] || key;
  };

  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
    : 0;

  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto flex items-center justify-center pt-24">
        <Loader2 size={36} className="spin-icon" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 md:py-20 max-w-7xl relative min-h-screen">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 relative z-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-[2px] w-20 bg-gradient-to-r from-primary to-transparent" />
            <span className="text-[0.65rem] font-black uppercase tracking-[0.6em] text-primary/80 font-heading">STRUCTURAL_INTEGRITY_PROTOCOL</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-[-0.06em] uppercase italic leading-[0.9] font-heading flex flex-col">
            <span className="text-zinc-800">DEEP_SCAN</span>
            <span className="text-white relative">
              TERMINAL
              <span className="absolute -inset-x-4 inset-y-0 bg-primary/10 blur-3xl -z-10" />
            </span>
          </h1>
          <p className="max-w-xl text-zinc-500 font-medium leading-relaxed text-sm md:text-base">
            High-precision algorithmic auditing for structural resume integrity. 
            Cross-referencing neural patterns against target deployment parameters 
            with 0.042ms terminal latency.
          </p>
        </div>

        <div className="flex flex-col items-end gap-6">
          <div className="flex items-center gap-8 px-8 py-4 bg-white/2 border border-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl">
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest">SATURN_OS</span>
                <span className="text-xs font-mono text-zinc-300">v1.2.4_STABLE</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest">UPLINK_STATUS</span>
                <span className="text-xs font-mono text-emerald-500 flex items-center gap-1.5 leading-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(true)} 
            className="group relative h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-[0.7rem] rounded-[2rem] transition-all shadow-3xl hover:shadow-primary/40 overflow-hidden border-none active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4 font-heading">
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
              INIT_AUDIT_SEQUENCE
            </div>
          </button>
        </div>
      </div>


      {/* Tactical Data Modules (Stats) */}
      {scores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group relative bg-white/2 border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/5 hover:border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <FileText size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[0.65rem] font-black text-zinc-500 uppercase tracking-[0.3em] font-heading">TOTAL_DEPLOYMENTS</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black italic tracking-tighter text-white font-heading">{scores.length}</span>
                <span className="text-[0.7rem] font-bold text-zinc-600 uppercase tracking-widest font-heading">Analyses</span>
              </div>
              <div className="h-[2px] w-full bg-white/5" />
              <p className="text-[0.6rem] text-zinc-600 font-medium uppercase tracking-wider">Neural storage capacity at 12%</p>
            </div>
          </div>

          <div className="group relative bg-white/2 border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/5 hover:border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[0.65rem] font-black text-zinc-500 uppercase tracking-[0.3em] font-heading">MEAN_INTEGRITY</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black italic tracking-tighter font-heading" style={{ color: getScoreColor(averageScore) }}>
                  {averageScore}
                  <small className="text-3xl ml-1 leading-none opacity-50">%</small>
                </span>
                <span className="text-[0.7rem] font-bold text-zinc-600 uppercase tracking-widest font-heading">AGGR</span>
              </div>
              <div className="h-[2px] w-full bg-white/5" />
              <p className="text-[0.6rem] text-zinc-600 font-medium uppercase tracking-wider">Across all architectural nodes</p>
            </div>
          </div>

          <div className="group relative bg-white/2 border border-white/5 p-10 rounded-[2.5rem] overflow-hidden transition-all hover:bg-white/5 hover:border-white/10 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <Award size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[0.65rem] font-black text-zinc-500 uppercase tracking-[0.3em] font-heading">PEAK_ALIGNMENT</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black italic tracking-tighter font-heading" style={{ color: getScoreColor(bestScore) }}>
                  {bestScore}
                  <small className="text-3xl ml-1 leading-none opacity-50">%</small>
                </span>
                <span className="text-[0.7rem] font-bold text-zinc-600 uppercase tracking-widest font-heading">MAX</span>
              </div>
              <div className="h-[2px] w-full bg-white/5" />
              <p className="text-[0.6rem] text-zinc-600 font-medium uppercase tracking-wider">Highest recorded neural match</p>
            </div>
          </div>
        </div>
      )}


      {/* Score history */}
      {/* Score history */}
      <div className="space-y-10 relative z-10">
        <div className="flex items-center gap-6 mb-12">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <h2 className="text-[0.75rem] font-black uppercase tracking-[0.5em] text-zinc-500 italic font-heading">STRUCTURAL_DEPLOYMENT_LOGS</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {scores.length === 0 ? (
          <div className="relative group bg-white/2 border-2 border-dashed border-white/5 rounded-[3rem] p-32 text-center overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-10 group-hover:text-primary transition-colors">
              <Target size={48} className="opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-widest text-zinc-400 mb-4 font-heading">NO_NEURAL_PATTERNS_FOUND</h3>
            <p className="text-zinc-600 max-w-md mx-auto mb-12 font-medium text-sm leading-relaxed">
              Initialize a structural audit to begin cross-referencing resume architecture against target job parameters.
            </p>
            <button 
              onClick={() => setShowModal(true)} 
              className="px-12 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.4em] text-[0.65rem] hover:bg-primary hover:border-primary transition-all rounded-full shadow-xl hover:shadow-primary/30 font-heading"
            >
              INIT_FIRST_AUDIT
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {scores.map(score => (
              <div
                key={score.id}
                className="group relative bg-white/2 border border-white/5 rounded-[2.5rem] p-8 cursor-pointer transition-all hover:bg-white/5 hover:border-white/10 hover:-translate-y-1 shadow-2xl"
                onClick={() => { setViewingScore(score); setDetailedResult(score.fullResult || null); }}
              >
                {/* Visual Accent */}
                <div className="absolute top-8 left-0 bottom-8 w-1.5 bg-primary/0 group-hover:bg-primary rounded-r-full transition-all" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-10">
                    <div className="relative flex items-center justify-center h-20 w-20 group-hover:scale-110 transition-transform">
                      {/* Technical Progress Ring */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-white/5"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={226.2}
                          strokeDashoffset={226.2 * (1 - score.score / 100)}
                          className="transition-all duration-[1500ms] cubic-bezier(0.4, 0, 0.2, 1)"
                          style={{ color: getScoreColor(score.score), filter: `drop-shadow(0 0 8px ${getScoreColor(score.score)}44)` }}
                        />
                      </svg>
                      <span className="text-lg font-black font-heading italic" style={{ color: getScoreColor(score.score) }}>
                        {score.score}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-[0.6rem] font-mono text-zinc-600 uppercase tracking-tighter">SEQ_{score.id.substring(0, 12)}</span>
                        <div className="h-[1px] w-6 bg-white/10" />
                        <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] px-3 py-1 bg-zinc-950 border border-white/5 rounded-full" style={{ color: getScoreColor(score.score) }}>
                          {getScoreLabel(score.score)}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tight text-white flex items-center gap-4 font-heading group-hover:text-primary transition-colors">
                        {score.resume.title}
                        <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse shrink-0" />
                      </h4>
                      <div className="flex items-center gap-6 mt-3 text-zinc-500">
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-2">
                          <Clock size={14} className="opacity-40" /> 
                          {new Date(score.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {score.jdSnippet && (
                          <>
                            <div className="h-1 w-1 bg-white/10 rounded-full" />
                            <span className="text-[0.65rem] font-medium italic truncate max-w-[200px] md:max-w-[400px]">
                              PARAMETER_MATCH: {score.jdSnippet.substring(0, 60)}...
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-10 md:gap-4 border-l border-white/5 pl-10 md:pl-0 md:border-l-0">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest mb-1">ALIGNMENT</span>
                        <span className="text-xl font-black text-emerald-500 flex items-center gap-2 italic">
                          <CheckCircle2 size={16} /> {(score.matched as string[])?.length || 0}
                        </span>
                      </div>
                      <div className="h-10 w-[1px] bg-white/5" />
                      <div className="flex flex-col items-end">
                        <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest mb-1">CONFL_TOTAL</span>
                        <span className="text-xl font-black text-red-500 flex items-center gap-2 italic">
                          <AlertCircle size={16} /> {(score.missing as string[])?.length || 0}
                        </span>
                      </div>
                    </div>
                    <button className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-primary/60 group-hover:text-primary group-hover:translate-x-2 transition-all flex items-center gap-3 font-heading">
                      ACCESS_FULL_REPORT <BarChart3 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Run Analysis Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[120] bg-zinc-950/40 backdrop-blur-3xl flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col overflow-hidden animate-in fade-in zoom-in duration-500">
            {/* Terminal Header Decor */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            
            <div className="p-10 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-zinc-900 border border-primary/30 rounded-2xl flex items-center justify-center text-primary relative overflow-hidden">
                  <Target size={24} />
                  <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-widest text-white font-heading">INIT_AUDIT</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[0.6rem] font-black text-zinc-500 uppercase tracking-[0.3em]">PROTOCOL: ATS_SCAN_V4_SATURN</span>
                    <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
                  </div>
                </div>
              </div>
              <button 
                className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10">
              {/* Input mode tabs */}
              <div className="flex gap-4 mb-10 p-1.5 bg-zinc-950 rounded-2xl border border-white/5">
                <button
                  onClick={() => setInputMode('select')}
                  className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-[0.65rem] transition-all font-heading ${inputMode === 'select' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  <FileText size={16} /> NEURAL_REPOSITORY
                </button>
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.3em] text-[0.65rem] transition-all font-heading ${inputMode === 'upload' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  <Upload size={16} /> EXTERNAL_FEED
                </button>
              </div>

              {/* Resume input */}
              <div className="space-y-8 mb-10">
                {inputMode === 'select' ? (
                  <div className="space-y-3">
                    <label className="text-[0.6rem] font-black text-zinc-500 uppercase tracking-[0.4em] ml-2 font-heading">SELECT_ARCHITECTURAL_PATTERN</label>
                    <div className="relative group">
                      <select
                        value={selectedResume}
                        onChange={e => setSelectedResume(e.target.value)}
                        className="w-full h-16 bg-white/2 border border-white/10 rounded-2xl px-6 text-zinc-200 font-mono text-sm focus:border-primary/50 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-zinc-950 text-zinc-500">Repository Select...</option>
                        {resumes.map(r => (
                          <option key={r.id} value={r.id} className="bg-zinc-950 text-white">{r.title}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-focus-within:text-primary transition-colors">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[0.6rem] font-black text-zinc-500 uppercase tracking-[0.4em] ml-2 font-heading">PATTERN_UPLINK (BY_FILE)</label>
                    {uploadedFileName ? (
                      <div className="flex items-center gap-6 p-6 bg-white/2 border border-primary/20 rounded-2xl shadow-inner">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <File size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-white">{uploadedFileName}</p>
                          <p className="text-[0.55rem] font-black text-primary/60 uppercase tracking-widest mt-1 uppercase">Ready for parsing</p>
                        </div>
                        <button onClick={() => { setUploadedText(''); setUploadedFileName(''); }} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-zinc-600 hover:text-red-500 transition-all">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full py-14 bg-white/2 border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-5 text-zinc-600 hover:text-zinc-300 group shadow-inner"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-4">
                            <Loader2 size={32} className="animate-spin text-primary" />
                            <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] font-heading">STRUCTURAL_PARSING...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-3xl bg-zinc-950 flex items-center justify-center border border-white/5 group-hover:border-primary/20 group-hover:text-primary transition-all">
                                <Upload size={28} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] font-heading">UPLINK_FRAGMENT_OR_FEED</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[0.6rem] font-black text-zinc-500 uppercase tracking-[0.4em] ml-2 font-heading">DEP_PARAMS (JOB_SPEC)</label>
                  <textarea
                    value={jd}
                    onChange={e => setJd(e.target.value)}
                    className="w-full h-48 bg-white/2 border border-white/10 rounded-[2.5rem] p-8 text-zinc-200 font-mono text-sm focus:border-primary/50 outline-none transition-all resize-none shadow-inner placeholder:text-zinc-800"
                    placeholder="Paste technical requirements for cross-reference..."
                  />
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !(inputMode === 'select' ? selectedResume : uploadedText.trim()) || !jd.trim()}
                className="group relative w-full h-20 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-[0.5em] text-[0.8rem] transition-all rounded-full shadow-3xl disabled:opacity-30 disabled:grayscale overflow-hidden border-none active:scale-[0.98] font-heading"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                <span className="relative z-10 flex items-center justify-center gap-5">
                  {analyzing ? (
                    <><Loader2 size={24} className="animate-spin" /> CROSS_REFERENCING...</>
                  ) : (
                    <><Zap size={20} /> INITIALIZE_STRUCTURAL_AUDIT</>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Score Detail Modal */}
      {viewingScore && (
        <div className="fixed inset-0 z-[120] bg-zinc-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] relative flex flex-col overflow-hidden max-h-[95vh]">
            {/* Report Header Decor */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            
            <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/50">
              <div className="flex items-center gap-6">
                <div className="relative flex items-center justify-center h-20 w-20">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 scale-125">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray={201}
                      strokeDashoffset={201 * (1 - viewingScore.score / 100)}
                      className="transition-all duration-1000 ease-out"
                      style={{ color: getScoreColor(viewingScore.score) }}
                    />
                  </svg>
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-2xl font-black italic leading-none" style={{ color: getScoreColor(viewingScore.score) }}>{viewingScore.score}%</span>
                    <span className="text-[0.5rem] font-black uppercase text-zinc-500 tracking-tighter mt-1">Integrity</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[0.6rem] font-black text-primary uppercase tracking-[0.3em]">Structural Audit Report</span>
                    <div className="h-1 w-1 bg-zinc-700 rounded-full" />
                    <span className="text-[0.6rem] font-mono text-zinc-500 uppercase tracking-widest">SEQ_{viewingScore.id.substring(0, 8)}</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">{viewingScore.resume.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 border border-white/5 rounded-sm">
                      <Clock size={10} className="text-zinc-500" />
                      <span className="text-[0.6rem] font-bold text-zinc-400 uppercase tracking-widest">{new Date(viewingScore.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <span className="text-[0.65rem] font-black uppercase tracking-widest" style={{ color: getScoreColor(viewingScore.score) }}>
                      Status: {getScoreLabel(viewingScore.score)}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                className="p-3 bg-zinc-950 border border-white/10 hover:border-white/30 text-zinc-500 hover:text-white transition-all rounded-sm"
                onClick={() => { setViewingScore(null); setDetailedResult(null); }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
              {/* Overall Assessment Terminal */}
              {detailedResult?.overallVerdict && (
                <div className="relative group bg-zinc-950 border border-primary/20 p-8 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap size={16} className="text-primary" />
                      <h4 className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Algorithmic Verdict</h4>
                    </div>
                    <p className="text-lg font-medium leading-relaxed text-zinc-200">
                      {detailedResult.overallVerdict}
                    </p>
                  </div>
                  <div className="absolute bottom-2 right-4 flex items-center gap-2 opacity-10 font-mono text-[0.6rem] text-primary">
                    <span className="animate-pulse">SCANNING COMPLETE</span>
                    <span>10.02.44.X</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Score Breakdown Column */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <BarChart3 size={16} className="text-primary" />
                    <h4 className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Component Alignment</h4>
                  </div>
                  
                  {detailedResult ? (
                    <div className="space-y-4">
                      {[
                        { label: 'Keyword Match', score: detailedResult.keywordScore, weight: '35%', icon: <Target size={14} /> },
                        { label: 'Neural Sections', score: detailedResult.sectionScore, weight: '20%', icon: <FileText size={14} /> },
                        { label: 'Impact Density', score: detailedResult.bulletScore, weight: '15%', icon: <Award size={14} /> },
                        { label: 'Neural Readability', score: detailedResult.readabilityScore, weight: '15%', icon: <Zap size={14} /> },
                        { label: 'Visual Format', score: detailedResult.formatScore, weight: '15%', icon: <Shield size={14} /> },
                      ].map(item => (
                        <div key={item.label} className="bg-zinc-950/50 border border-white/5 p-4 group hover:border-primary/20 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                              <span className="text-[0.7rem] font-black uppercase tracking-widest text-zinc-400">{item.label}</span>
                            </div>
                            <span className="text-sm font-black italic pr-1" style={{ color: getScoreColor(item.score) }}>{item.score}%</span>
                          </div>
                          <div className="h-1 bg-white/5 overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
                              style={{ width: `${item.score}%`, backgroundColor: getScoreColor(item.score) }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 bg-zinc-950/50 border border-dashed border-white/10 text-center">
                      <span className="text-[0.6rem] font-black uppercase tracking-widest text-zinc-600">No Breakdown Data Available</span>
                    </div>
                  )}
                </div>

                {/* Tactical Stats Column */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-primary" />
                    <h4 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-zinc-400 font-heading">INTEGRITY_READOUT</h4>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed italic">
                    The structural audit has completed. Match-telemetry indicates a {viewingScore.score}% alignment with provided deployment parameters. Structural integrity is <span style={{ color: getScoreColor(viewingScore.score) }}>{getScoreLabel(viewingScore.score)}</span> based on neural pattern extraction.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/2 border border-white/5 p-6 rounded-2xl">
                      <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest block mb-2 font-heading">POSITIVE_MATCHES</span>
                      <span className="text-3xl font-black text-emerald-500 font-heading">{(viewingScore.matched as string[])?.length || 0}</span>
                    </div>
                    <div className="bg-white/2 border border-white/5 p-6 rounded-2xl">
                      <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest block mb-2 font-heading">CONFLICT_POINTS</span>
                      <span className="text-3xl font-black text-red-500 font-heading">{(viewingScore.missing as string[])?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keyword Analysis Terminal */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Target size={16} className="text-primary" />
                  <h4 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-zinc-400 font-heading">STRUCTURAL_ALIGNMENT_MATRIX</h4>
                </div>

                <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-inner">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-zinc-900/50">
                        <th className="px-8 py-5 text-left text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 font-heading">KEYWORD_FRAGMENT</th>
                        <th className="px-8 py-5 text-center text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 font-heading">SECTOR</th>
                        <th className="px-8 py-5 text-center text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 font-heading">REL_MATCH</th>
                        <th className="px-8 py-5 text-right text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500 border-b border-white/5 font-heading">DENSITY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 shadow-inner">
                      {(detailedResult?.keywords || []).map((kw, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-4 font-mono text-xs text-zinc-300 group-hover:text-primary transition-colors">{kw.keyword}</td>
                          <td className="px-8 py-4 text-center">
                            <span className="text-[0.5rem] font-black px-3 py-1 bg-zinc-950 border border-white/10 uppercase tracking-widest text-zinc-500 rounded-full">{kw.category}</span>
                          </td>
                          <td className="px-8 py-4 text-center">
                            {kw.found ? <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <div className="w-2 h-2 rounded-full bg-red-500 mx-auto shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                          </td>
                          <td className="px-8 py-4 text-right font-mono text-xs font-bold" style={{ color: kw.found ? '#10b981' : '#ef4444' }}>{kw.frequency}X</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!detailedResult?.keywords || detailedResult.keywords.length === 0) && (
                    <div className="p-20 text-center flex flex-col items-center gap-6">
                      <Loader2 className="animate-spin text-zinc-800" size={32} />
                      <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-zinc-700 italic font-heading">EXTRACTING_NEURAL_PATTERNS...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actionable Directives */}
              {(detailedResult?.suggestions?.length || 0) > 0 && (
                <div className="space-y-8 pb-10">
                  <div className="flex items-center gap-3">
                    <Lightbulb size={16} className="text-amber-500" />
                    <h4 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-zinc-400 font-heading">OPTIMIZATION_DIRECTIVES</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {detailedResult?.suggestions?.map((s, i) => (
                      <div key={i} className="flex gap-6 p-8 bg-white/2 border border-white/5 rounded-[2rem] group hover:bg-white/5 hover:border-amber-500/20 transition-all shadow-xl">
                        <span className="text-xs font-black italic text-amber-500/30 group-hover:text-amber-500 transition-colors font-heading">#{i+1}</span>
                        <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-200 transition-colors font-medium">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Metrics Overlay */}
            <div className="p-6 bg-zinc-950 border-t border-white/5 flex items-center justify-between text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-600 font-heading">
              <div className="flex gap-10">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  AUDIT_NODE: SATURN_RING_01
                </span>
                <span>LATENCY: 0.042MS</span>
              </div>
              <div className="flex gap-10">
                <span className="text-zinc-400">Wordcount: <span className="text-zinc-200 font-mono">{detailedResult?.formatMetrics?.wordCount || 0}</span></span>
                <span className="text-zinc-400">Pages: <span className="text-zinc-200 font-mono">{detailedResult?.formatMetrics?.estimatedPages || 0}</span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt"
        onChange={handleFileUpload}
      />
    </div>
  );
}

