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
        const date = new Date(job.created);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 30) return `${diffInDays} days ago`;
        return date.toLocaleDateString();
    }, [job.created]);

    return (
        <Card className="group relative overflow-hidden border-white/5 bg-zinc-950/20 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] ring-1 ring-white/5">
            {/* Background Gradient Detail */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-[80px] transition-all group-hover:bg-primary/10" />
            
            <div className="relative p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.6rem] font-black uppercase tracking-widest text-primary ring-1 ring-inset ring-primary/20">
                                {job.category || 'Featured'}
                            </span>
                            <div className="flex items-center gap-1 text-[0.6rem] font-bold text-zinc-500 uppercase tracking-tighter">
                                <Calendar size={10} />
                                {timeAgo}
                            </div>
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-white group-hover:text-primary transition-colors line-clamp-1 font-heading uppercase">
                            {job.title}
                        </h3>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/20 transition-all">
                        <Building2 className="text-zinc-400 group-hover:text-primary transition-colors" size={24} />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-[0.7rem] font-bold uppercase tracking-widest text-zinc-400">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <Briefcase size={12} className="text-primary" />
                        {job.company}
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <MapPin size={12} className="text-primary" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                        <DollarSign size={12} className="text-primary" />
                        {job.salary}
                    </div>
                </div>

                <div className="mt-6">
                    <p className="text-sm leading-relaxed text-zinc-500 line-clamp-3">
                        {job.description}
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                   <div className="flex items-center gap-1.5">
                        <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-emerald-500/80">Active Listing</span>
                   </div>
                    
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[0.65rem] rounded-full transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] hover:shadow-primary/40 group/btn">
                             <span className="flex items-center gap-2">
                                Apply Now
                                <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                             </span>
                        </Button>
                    </a>
                </div>
            </div>

            {/* Hover Glint Effect */}
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>
    );
}
