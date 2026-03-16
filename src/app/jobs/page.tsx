'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
    Briefcase, Search, Loader2, Sparkles, 
    AlertCircle, RefreshCcw, TrendingUp, 
    Zap, Globe, Filter, ChevronRight
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

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/auth/signin');
        if (status === 'authenticated') fetchJobs(1);
    }, [status, router]);

    const fetchJobs = async (pageNum: number, isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        
        setError(null);
        try {
            const res = await fetch(`/api/jobs/search?page=${pageNum}`);
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
                setTotal(prev => isLoadMore ? prev + newJobs.length : data.total || 0);
                setSearchStatus(data.status || 'partial');
                setPage(pageNum);
                
                // If we got results, assume there might be more unless very few returned
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

                {/* Stats / Filters Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Neural Matches', value: loading ? '...' : total, icon: <Zap className="text-primary" /> },
                        { label: 'Active Sectors', value: '14', icon: <Globe className="text-zinc-400" /> },
                        { label: 'Search Latency', value: '42ms', icon: <TrendingUp className="text-emerald-500" /> },
                        { label: 'Match Confidence', value: '94%', icon: <Sparkles className="text-amber-500" /> }
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
        </div>
    );
}
