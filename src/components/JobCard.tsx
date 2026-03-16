'use client';

import React from 'react';
import { Briefcase, MapPin, ExternalLink, Calendar, Building2, Sparkles, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface JobCardProps {
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        description: string;
        url: string;
        salary: string;
        created: string;
        category?: string;
    };
}

export default function JobCard({ job }: JobCardProps) {
    const timeAgo = React.useMemo(() => {
        if (!job.created || job.created.startsWith('1970') || job.created === '0') return 'Neural Sync Active';
        try {
            const date = new Date(job.created);
            if (isNaN(date.getTime())) return 'Recently';
            const now = new Date();
            const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
            if (diffInDays === 0) return 'Today';
            if (diffInDays === 1) return 'Yesterday';
            if (diffInDays < 30) return `${diffInDays} days ago`;
            return date.toLocaleDateString();
        } catch (e) {
            return 'Neural Sync Active';
        }
    }, [job.created]);

    return (
        <Card className="group relative flex flex-col h-full overflow-hidden border-white/5 bg-zinc-950/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_80px_rgba(var(--primary-rgb),0.2)] ring-1 ring-white/5 rounded-[2.5rem]">
            {/* Background Gradient Detail */}
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-[100px] transition-all group-hover:bg-primary/20 pointer-events-none" />
            <div className="absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-primary/5 blur-[100px] transition-all group-hover:bg-primary/10 pointer-events-none" />
            
            <div className="relative p-8 flex flex-col flex-1">
                {/* Header: Meta & Company Icon */}
                <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="space-y-3 flex-1 overflow-hidden">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[0.6rem] font-black uppercase tracking-widest text-primary ring-1 ring-inset ring-primary/20">
                                {job.category || 'Neural Crawler'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[0.6rem] font-bold text-zinc-500 uppercase tracking-widest">
                                <Calendar size={12} className="text-zinc-600" />
                                {timeAgo}
                            </div>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors line-clamp-2 font-heading uppercase italic leading-tight">
                            {job.title}
                        </h3>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 group-hover:border-primary/40 transition-all shadow-xl">
                        <Building2 className="text-zinc-500 group-hover:text-primary transition-colors" size={28} />
                    </div>
                </div>

                {/* Badges Container */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {job.company && (
                        <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5 text-[0.65rem] font-black uppercase tracking-widest text-zinc-300">
                            <Briefcase size={14} className="text-primary/60" />
                            {job.company}
                        </div>
                    )}
                    {job.location && (
                        <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5 text-[0.65rem] font-black uppercase tracking-widest text-zinc-300">
                            <MapPin size={14} className="text-primary/60" />
                            <span className="truncate max-w-[150px]">{job.location}</span>
                        </div>
                    )}
                    {job.salary && job.salary !== '$' && (
                        <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5 text-[0.65rem] font-black uppercase tracking-widest text-zinc-300">
                            <DollarSign size={14} className="text-primary/60" />
                            {job.salary}
                        </div>
                    )}
                </div>

                {/* Description - Fills Space */}
                <div className="flex-1 mb-8">
                    <p className="text-sm leading-relaxed text-zinc-500 line-clamp-4 font-medium italic">
                        {job.description || "Synthesizing position requirements from neural web clusters. Technical specifications arriving shortly..."}
                    </p>
                </div>

                {/* Footer: Actions */}
                <div className="mt-auto space-y-6">
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    <div className="flex items-center gap-3 w-full">
                        <Button 
                            onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new CustomEvent('init-tailoring', { 
                                    detail: { jobTitle: job.title, jobDescription: job.description } 
                                }));
                            }}
                            className="flex-1 h-11 px-4 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-primary font-black uppercase tracking-[0.1em] text-[0.6rem] rounded-full transition-all group/tailor shadow-xl"
                        >
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <Sparkles size={14} className="group-hover/tailor:animate-pulse" />
                                Neural Tailor
                            </span>
                        </Button>

                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button className="w-full h-11 px-4 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.1em] text-[0.6rem] rounded-full transition-all shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/50 group/btn">
                                <span className="flex items-center gap-1.5 whitespace-nowrap">
                                    Apply Now
                                    <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </span>
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Hover Glint Effect */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </Card>
    );
}
