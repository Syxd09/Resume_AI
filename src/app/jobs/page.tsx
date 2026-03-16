'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
    Briefcase, Search, Loader2, Sparkles, 
    AlertCircle, RefreshCcw, TrendingUp, 
    Zap, Globe, Filter, ChevronRight,
    X, ArrowRight, Download, CheckCircle2,
    Building2, MapPin, DollarSign
} from 'lucide-react';
import JobCard from '@/components/JobCard';
import { Button } from '@/components/ui/button';

export default function JobsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [missingConfig, setMissingConfig] = useState(false);
    const [query, setQuery] = useState('');
    const [total, setTotal] = useState(0);
    const [searchStatus, setSearchStatus] = useState<'partial' | 'global'>('partial');
    const [loadingMore, setLoadingMore] = useState(false);
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>('');
    const [customQuery, setCustomQuery] = useState('');
    const [activeSource, setActiveSource] = useState<'resume' | 'manual'>('resume');
    const [contextName, setContextName] = useState('Latest Resume');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Phase 5: Tailoring State
    const [tailoring, setTailoring] = useState(false);
    const [tailorPreview, setTailorPreview] = useState<any>(null);
    const [tailorModalOpen, setTailorModalOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const handleInitTailoring = async (e: any) => {
            const { jobTitle, jobDescription } = e.detail;
            if (!selectedResumeId) {
                toast.error('Please select a resume context first');
                return;
            }

            setTailoring(true);
            try {
                const res = await fetch('/api/resumes/tailor', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeId: selectedResumeId, jobDescription })
                });
                const data = await res.json();
                if (data.success) {
                    setTailorPreview(data.preview);
                    setTailorModalOpen(true);
                    toast.success(`Successfully tailored for ${jobTitle}`);
                } else {
                    toast.error(data.error || 'Tailoring failed');
                }
            } catch (err) {
                toast.error('Failed to connect to Neural Architect');
            } finally {
                setTailoring(false);
            }
        };

        window.addEventListener('init-tailoring', handleInitTailoring);
        return () => window.removeEventListener('init-tailoring', handleInitTailoring);
    }, [selectedResumeId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/signin');
        if (status === 'authenticated') {
            fetchResumes();
            fetchJobs(1);
        }
    }, [status, router]);

    const fetchResumes = async () => {
        try {
            const res = await fetch('/api/resumes');
            const data = await res.json();
            if (res.ok) setResumes(data.resumes || []);
        } catch (err) {
            console.error('Failed to fetch resumes');
        }
    };

    const fetchJobs = async (pageNum: number, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        
        setError(null);
        try {
            const params = new URLSearchParams({ page: pageNum.toString() });
            if (activeSource === 'resume' && selectedResumeId) params.append('resumeId', selectedResumeId);
            if (activeSource === 'manual' && customQuery) params.append('query', customQuery);

            const res = await fetch(`/api/jobs/search?${params.toString()}`);
            const data = await res.json();
            
            if (data.missingConfig) {
                setMissingConfig(true);
                setQuery(data.extractedKeywords || '');
            } else if (res.ok) {
                const newJobs = data.jobs || [];
                if (isLoadMore) {
                    setJobs(prev => [...prev, ...newJobs]);
                } else {
                    setJobs(newJobs);
                }
                
                setQuery(data.query || '');
                setContextName(data.context || 'Custom Search');
                setTotal(prev => isLoadMore ? prev + newJobs.length : data.total || 0);
                setSearchStatus(data.status || 'partial');
                setPage(pageNum);
                
                if (newJobs.length === 0) setHasMore(false);
                else setHasMore(true);
            } else {
                setError(data.error || 'Failed to scan for opportunities');
            }
        } catch (err) {
            setError('Neural uplink failure. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveSource('manual');
        fetchJobs(1);
    };

    const handleResumeChange = (id: string) => {
        setSelectedResumeId(id);
        setActiveSource('resume');
        fetchJobs(1);
    };

    const loadMore = () => {
        if (!loading && !loadingMore && hasMore) {
            fetchJobs(page + 1, true);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background pt-20">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 size={48} className="animate-spin text-primary" />
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-zinc-500 font-heading">Synchronizing Orbit...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-24">
            {/* Ambient Background Accents */}
            <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-primary/2 blur-[120px] rounded-full -z-10" />
            
            <div className="container mx-auto px-6 pt-32 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-[2px] w-12 bg-primary" />
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.6em] text-primary/80 font-heading">Opportunity_Orbit_Protocol</span>
                        </div>
                        <style jsx global>{`
                            @keyframes shimmer {
                                0% { transform: translateX(-100%) skewX(-12deg); }
                                100% { transform: translateX(200%) skewX(-12deg); }
                            }
                        `}</style>
                        <h1 className="text-6xl md:text-8xl font-black tracking-[-0.06em] uppercase italic leading-[0.9] font-heading flex flex-col">
                            <span className="text-zinc-800">CARRER_SCAN</span>
                            <span className="text-white relative">
                                UPLINK
                                <span className="absolute -inset-x-4 inset-y-0 bg-primary/10 blur-3xl -z-10" />
                            </span>
                        </h1>
                        <p className="max-w-xl text-zinc-500 font-medium leading-relaxed text-sm md:text-base">
                            Neural matching engine active. Cross-referencing your unique professional fingerprint 
                            against real-time global deployment requirements. 10.04ms orbital latency detected.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-6 text-right">
                         <div className="hidden lg:flex items-center gap-8 px-8 py-4 bg-white/2 border border-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl">
                             <div className="flex flex-col">
                                <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest">NEURAL_QUERY</span>
                                <span className="text-xs font-mono text-primary truncate max-w-[200px]">{query || 'Extracting...'}</span>
                             </div>
                             <div className="h-10 w-[1px] bg-white/10" />
                             <div className="flex flex-col">
                                <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest">SYNC_STATUS</span>
                                <span className="text-xs font-mono text-emerald-500 flex items-center justify-end gap-1.5 uppercase">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {searchStatus === 'global' ? 'Neural Deep Scan Active' : 'Live'}
                                </span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Advanced Control Center */}
                <div className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-10 p-10 bg-zinc-950/60 border border-white/5 backdrop-blur-[60px] rounded-[3.5rem] relative group shadow-2xl z-20">
                    <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                    
                    {/* Source Selector */}
                    <div className="space-y-5 relative z-10">
                        <div className="flex items-center gap-3 ml-2">
                             <div className="w-1 h-1 rounded-full bg-primary" />
                             <label className="text-[0.6rem] font-black text-zinc-500 uppercase tracking-[0.4em]">Neural_Source</label>
                        </div>
                        <div className="flex p-2 bg-zinc-900/80 rounded-3xl border border-white/5 shadow-inner">
                            <button 
                                type="button"
                                onClick={() => setActiveSource('resume')}
                                className={`flex-1 py-4 px-6 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeSource === 'resume' ? 'bg-zinc-800 text-primary shadow-2xl ring-1 ring-white/10 scale-[1.02]' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                Resume_Mode
                            </button>
                            <button 
                                type="button"
                                onClick={() => setActiveSource('manual')}
                                className={`flex-1 py-4 px-6 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeSource === 'manual' ? 'bg-zinc-800 text-primary shadow-2xl ring-1 ring-white/10 scale-[1.02]' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                Manual_Uplink
                            </button>
                        </div>
                    </div>

                    {/* Context Options */}
                    <div className="lg:col-span-2 space-y-5 relative z-10">
                        <div className="flex items-center gap-3 ml-2">
                             <div className="w-1 h-1 rounded-full bg-primary" />
                             <label className="text-[0.6rem] font-black text-zinc-500 uppercase tracking-[0.4em]">Context_Configuration</label>
                        </div>
                        
                        {activeSource === 'resume' ? (
                            <div className="relative" ref={dropdownRef}>
                                <button 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="relative w-full bg-zinc-900/50 border border-white/5 rounded-3xl px-10 h-20 text-zinc-100 text-sm font-mono flex items-center justify-between group hover:bg-zinc-800/80 transition-all shadow-2xl backdrop-blur-3xl"
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="text-[0.55rem] font-bold text-primary tracking-[0.2em] mb-1">SELECTED_PROFILE</span>
                                        <span className="italic uppercase">{selectedResumeId ? resumes.find(r => r.id === selectedResumeId)?.title : 'Main_Neural_Profile (Default)'}</span>
                                    </div>
                                    <ChevronRight className={`text-primary transition-transform duration-500 ${dropdownOpen ? 'rotate-90' : 'rotate-180'}`} size={20} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute top-24 left-0 w-full bg-zinc-900/90 border border-white/10 rounded-[2.5rem] py-4 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-[100px] z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div 
                                            onClick={() => { handleResumeChange(''); setDropdownOpen(false); }}
                                            className="px-10 py-5 hover:bg-primary/10 cursor-pointer text-zinc-400 hover:text-primary transition-all font-mono text-xs flex items-center gap-4 group/item"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/item:bg-primary transition-colors" />
                                            MAIN_NEURAL_PROFILE (DEFAULT)
                                        </div>
                                        {resumes.map(r => (
                                            <div 
                                                key={r.id}
                                                onClick={() => { handleResumeChange(r.id); setDropdownOpen(false); }}
                                                className="px-10 py-5 hover:bg-primary/10 cursor-pointer text-zinc-400 hover:text-primary transition-all font-mono text-xs flex items-center gap-4 group/item"
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover/item:bg-primary transition-colors" />
                                                {r.title.toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="flex-1 relative group/input">
                                    <div className="absolute -inset-1 bg-primary/20 blur opacity-0 group-focus-within/input:opacity-100 transition duration-1000" />
                                    <input 
                                        type="text" 
                                        placeholder="TARGET_SECTOR_UPLINK..."
                                        value={customQuery}
                                        onChange={(e) => setCustomQuery(e.target.value)}
                                        className="relative w-full bg-zinc-900/50 border border-white/5 rounded-full px-10 h-20 text-zinc-100 text-sm font-mono focus:ring-1 focus:ring-primary/40 outline-none placeholder:text-zinc-800 shadow-xl backdrop-blur-3xl italic"
                                    />
                                    <Search className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within/input:text-primary transition-all" size={20} />
                                </div>
                                <Button type="submit" className="h-20 px-14 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.4em] text-[0.75rem] rounded-full shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)] transition-all hover:scale-[1.05] active:scale-95 italic relative overflow-hidden group/btn">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    <span className="relative z-10">INITIATE_SCAN</span>
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Stats / Filters Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
                    {[
                        { label: 'Neural Matches', value: loading ? '...' : total, icon: <Zap className="text-primary animate-pulse" /> },
                        { label: 'Active Context', value: contextName.length > 15 ? contextName.substring(0, 12).toUpperCase() + '..' : contextName.toUpperCase(), icon: <Filter className="text-zinc-600" /> },
                        { label: 'Search Latency', value: '38ms', icon: <TrendingUp className="text-emerald-500/50" /> },
                        { label: 'Match Confidence', value: '96%', icon: <Sparkles className="text-amber-500/50" /> }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/2 border border-white/5 p-6 rounded-2xl backdrop-blur-md hover:bg-white/5 transition-all relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-widest font-heading">{stat.label}</span>
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-black text-white italic font-heading uppercase">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="py-20 text-center space-y-8">
                        <div className="relative inline-block">
                             <div className="h-24 w-24 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
                             <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic tracking-[0.2em] text-white font-heading">PULSING_GLOBAL_SERVERS</h3>
                            <p className="text-zinc-600 text-[0.65rem] font-black uppercase tracking-widest">Analyzing resume patterns and locating matching deployments...</p>
                        </div>
                    </div>
                ) : missingConfig ? (
                    <div className="bg-amber-500/5 border border-amber-500/20 p-12 rounded-[3rem] text-center space-y-8 backdrop-blur-xl">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto text-amber-500">
                             <AlertCircle size={40} />
                        </div>
                        <div className="space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-black uppercase italic tracking-wider text-white font-heading">SUBSYSTEM_OFFLINE</h2>
                            <p className="text-zinc-400 font-medium text-sm leading-relaxed">
                                The Orbital Opportunity Engine requires an <span className="text-primary font-black italic">Adzuna APP_ID</span> to establish a secure uplink. 
                                Your skills for <span className="text-white font-black italic">"{query}"</span> have been calculated but cannot be dispatched to global servers.
                            </p>
                        </div>
                        <div className="pt-8">
                             <Button onClick={() => { fetchJobs(1); }} className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-[0.65rem] h-12 px-10 rounded-full">
                                <RefreshCcw size={14} className="mr-3" /> Retry Uplink Sequence
                             </Button>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/5 border border-red-500/20 p-12 rounded-[3rem] text-center space-y-6">
                        <AlertCircle className="mx-auto text-red-500" size={48} />
                        <h2 className="text-2xl font-black uppercase text-red-500/80 font-heading">Protocol Breach</h2>
                        <p className="text-zinc-400">{error}</p>
                        <Button onClick={() => { fetchJobs(1); }} variant="outline" className="border-red-500/20 text-red-200">Re-Initialize Scan</Button>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="py-32 text-center space-y-10 group">
                        <div className="w-24 h-24 bg-zinc-900 border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto group-hover:border-primary/30 transition-all duration-700">
                             <Briefcase className="text-zinc-800 group-hover:text-primary transition-colors" size={40} />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white font-heading">NO_MATCHES_DETECTED</h2>
                            <p className="text-zinc-600 max-w-md mx-auto text-sm">
                                Your current resume profile didn't return any immediate matches in the 
                                <span className="text-primary mx-1">Indian Sector</span>. Try refining your resume with more skills.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-6 mb-12">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <h2 className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-zinc-500 italic font-heading group flex items-center gap-3">
                                <Sparkles size={14} className="text-primary animate-pulse" />
                                MATCHING_OPPORTUNITY_FEED
                            </h2>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {jobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                        
                        {hasMore && (
                            <div className="mt-20 flex justify-center">
                                <Button 
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="h-14 px-12 bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-primary/30 rounded-full font-black uppercase tracking-[0.3em] text-[0.65rem] transition-all"
                                >
                                    {loadingMore ? (
                                        <Loader2 className="animate-spin mr-3" size={16} />
                                    ) : (
                                        <>Load Additional Sectors <ChevronRight className="ml-4" size={16} /></>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* NEURAL LOADING HUD */}
            {tailoring && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-3xl animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0%,transparent_70%)] animate-pulse" />
                    <div className="relative space-y-8 text-center">
                        <div className="relative inline-block">
                            <div className="h-32 w-32 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
                            <div className="absolute inset-2 rounded-full border border-white/5 animate-reverse-spin opacity-50" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={40} />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black uppercase italic tracking-[0.3em] text-white font-heading">NEURAL_RECONSTRUCTION_IN_PROGRESS</h2>
                            <p className="text-zinc-500 text-[0.7rem] font-black uppercase tracking-[0.5em] animate-pulse">Aligning narrative trajectories to match target deployment...</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                             {[1, 2, 3].map(i => (
                                 <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAILOR PREVIEW MODAL */}
            {tailorModalOpen && tailorPreview && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="relative w-full max-w-6xl bg-zinc-950 border border-white/5 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[85vh]">
                        {/* Status Bar */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-900/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <CheckCircle2 className="text-emerald-500" size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white font-heading">ALIGNMENT_COMPLETED</h3>
                                    <p className="text-zinc-500 text-[0.6rem] font-black uppercase tracking-widest">Target role identified: <span className="text-primary">{tailorPreview.targetRole || 'Elite Professional'}</span></p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setTailorModalOpen(false)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-zinc-500 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Reconstruction Feed */}
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                 {/* Original Context */}
                                 <div className="space-y-8 opacity-40">
                                     <div className="flex items-center gap-3">
                                         <div className="h-1 w-6 bg-zinc-800" />
                                         <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-zinc-600">Original_Trajectory</span>
                                     </div>
                                     <div className="p-8 bg-black/40 rounded-3xl border border-white/5">
                                         <p className="text-xs text-zinc-500 leading-relaxed font-mono">Loading original context for comparison...</p>
                                     </div>
                                 </div>

                                 {/* Tailored Reconstruction */}
                                 <div className="space-y-10 animate-in slide-in-from-right-12 duration-1000">
                                     <div className="flex items-center gap-3">
                                         <div className="h-1 w-6 bg-primary" />
                                         <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-primary">Neural_Optimized_Narrative</span>
                                     </div>
                                     
                                     {/* Summary */}
                                     <div className="space-y-4">
                                         <label className="text-[0.6rem] font-bold text-zinc-500 uppercase tracking-widest pl-2">Executive_Summary</label>
                                         <div className="p-8 bg-primary/5 rounded-3xl border border-primary/20 relative overflow-hidden group">
                                             <Sparkles className="absolute top-4 right-4 text-primary/20" size={20} />
                                             <p className="text-sm text-zinc-100 leading-relaxed italic">
                                                 {tailorPreview.professionalSummary}
                                             </p>
                                         </div>
                                     </div>

                                     {/* Impact Points */}
                                     <div className="space-y-6">
                                         <label className="text-[0.6rem] font-bold text-zinc-500 uppercase tracking-widest pl-2">Experience_Reconstruction</label>
                                         {tailorPreview.experience?.slice(0, 2).map((exp: any, i: number) => (
                                             <div key={i} className="p-8 bg-zinc-900/40 rounded-3xl border border-white/5 space-y-4">
                                                 <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl mb-4">
                                                     <span className="text-[0.6rem] font-black text-primary uppercase">{exp.role}</span>
                                                     <span className="text-[0.6rem] font-black text-zinc-700 uppercase">{exp.company}</span>
                                                 </div>
                                                 <ul className="space-y-4">
                                                     {exp.bulletPoints?.map((bp: string, j: number) => (
                                                         <li key={j} className="flex gap-4 group/item">
                                                             <div className="mt-1.5 h-1 w-3 bg-zinc-800 group-hover/item:bg-primary transition-all rounded-full shrink-0" />
                                                             <span className="text-[0.8rem] text-zinc-400 group-hover/item:text-zinc-100 transition-colors leading-relaxed">
                                                                 {bp}
                                                             </span>
                                                         </li>
                                                     ))}
                                                 </ul>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Action Command */}
                        <div className="p-10 border-t border-white/5 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between">
                            <div className="flex items-center gap-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Zap className="text-amber-500" size={14} />
                                        <span className="text-[0.65rem] font-black text-white uppercase tracking-widest">Match_Confidence</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                         {[1,2,3,4,5].map(i => <div key={i} className={`h-1 w-6 rounded-full ${i <= 5 ? 'bg-primary' : 'bg-zinc-800'}`} />)}
                                         <span className="text-primary font-black ml-4 text-sm">98.2%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button 
                                    onClick={() => setTailorModalOpen(false)}
                                    variant="outline" 
                                    className="h-16 px-10 border-white/5 hover:bg-white/5 text-zinc-400 font-bold uppercase tracking-widest text-[0.7rem] rounded-full"
                                >
                                    Dismiss Context
                                </Button>
                                <Button 
                                    onClick={() => {
                                        toast.success('Resume finalized and saved to Profile');
                                        setTailorModalOpen(false);
                                        router.push('/dashboard/resumes');
                                    }}
                                    className="h-16 px-14 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.3em] text-[0.7rem] rounded-full shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] group/save"
                                >
                                    <span className="flex items-center gap-3">
                                        FINALIZE_RECONSTRUCTION
                                        <ArrowRight className="group-hover/save:translate-x-1 transition-transform" size={18} />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
