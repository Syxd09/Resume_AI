'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Sparkles, FileText, Target, Zap, ChevronRight, CheckCircle2,
  Upload, Briefcase, GraduationCap, Code, MessageCircle,
  BarChart3, Bot, ArrowRight, ClipboardList, Globe, ShieldCheck,
  MousePointer2, Stars, Cpu, Layers, User as UserIcon, Orbit,
  Rocket, Search, Shield, Info, Activity, Disc
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { status } = useSession();
  
  const ctaHref = status === 'authenticated' ? '/dashboard' : '/auth/signin';
  const ctaLabel = status === 'authenticated' ? 'ACCESS_STATION' : 'INITIALIZE_CORE';

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-zinc-950 text-foreground selection:bg-primary/30 selection:text-white">
      
      {/* 
        --- HERO: THE SATURN_AI_CORE --- 
        High-fidelity cinematic entry point with multi-layered depth.
      */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Deep Space Background Atmosphere */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 right-[-10%] w-[60vw] h-[60vw] bg-primary/10 blur-[180px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-amber-500/5 blur-[150px] rounded-full" />
            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150 pointer-events-none" />
        </div>

        <div className="container relative z-10 mx-auto text-center space-y-12">
          {/* Status Badge */}
          <div className="flex justify-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/5 bg-zinc-900/50 backdrop-blur-xl text-[0.6rem] font-black uppercase tracking-[0.5em] text-zinc-400">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CORE_UPLINK: ONLINE
              </div>
              <div className="h-4 w-[1px] bg-white/10" />
              <span>SATURN_OS_V1.2.4</span>
            </div>
          </div>

          {/* Main Title Architecture */}
          <div className="space-y-4">
              <h1 className="text-7xl md:text-[8rem] lg:text-[10rem] font-black tracking-[-0.05em] leading-[0.8] text-white uppercase italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 font-heading">
                SATURN<span className="text-primary not-italic">_AI</span>
              </h1>
              <div className="flex items-center justify-center gap-8 animate-in fade-in duration-1000 delay-500">
                <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-primary/40" />
                <p className="text-sm md:text-xl text-zinc-500 font-bold tracking-[0.4em] uppercase font-heading italic">
                    COGNITIVE_INTELLIGENCE_CORE
                </p>
                <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-primary/40" />
              </div>
          </div>

          <p className="max-w-2xl mx-auto text-zinc-400 font-medium leading-relaxed text-base md:text-lg animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-400">
            Reconstruct your professional narrative within the most advanced AI observatory. 
            Algorithmic precision for elite-tier deployments and structural career integrity.
          </p>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6 animate-in fade-in zoom-in duration-1000 delay-600">
            <Link href={ctaHref}>
              <button className="group relative h-20 px-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.4em] text-[0.75rem] rounded-full transition-all saturn-glow border-none overflow-hidden active:scale-[0.98] font-heading">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                <span className="relative z-10 flex items-center gap-4 group-hover:translate-x-1 transition-transform">{ctaLabel} <ChevronRight size={18} /></span>
              </button>
            </Link>
            
            <Link href="#protocol">
              <button className="h-20 px-16 border border-white/10 bg-white/2 hover:bg-white/5 text-zinc-500 hover:text-white font-black uppercase tracking-[0.4em] text-[0.7rem] rounded-full transition-all active:scale-[0.98] font-heading">
                ACCESS_BRIEF
              </button>
            </Link>
          </div>
        </div>

        {/* Cinematic Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
           <div className="w-[1px] h-16 bg-gradient-to-t from-primary to-transparent" />
           <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-600">Scroll Deployment</span>
        </div>
      </section>

      {/* 
        --- SECTION: PROTOCOL_MODULES --- 
        The core capabilities of the Saturn AI ecosystem.
      */}
      <section id="protocol" className="py-40 relative px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-20 bg-primary" />
                <span className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-primary font-heading">CAPABILITY_PROTOCOLS</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white font-heading">THE_STACK.</h2>
            </div>
            <p className="max-w-md text-zinc-500 font-bold uppercase tracking-[0.2em] text-[0.7rem] italic leading-relaxed">
                Propulsion systems for elite professional trajectories. Every module is hardened for terminal-ready output.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Observatory Control */}
            <div className="group relative bg-white/2 border border-white/5 p-12 rounded-[3.5rem] transition-all hover:bg-white/5 hover:border-primary/20 hover:-translate-y-2 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Orbit size={120} /></div>
               <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-3xl flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all">
                  <Activity size={32} />
               </div>
               <h3 className="text-3xl font-black uppercase italic text-white mb-6 font-heading">OBSERVATORY</h3>
               <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  High-performance workflow guiding you from zero to terminal-ready with surgical precision.
               </p>
               <div className="mt-10 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary animate-pulse" />
               </div>
            </div>

            {/* Feature 2: Deep Scan Terminal */}
            <div className="group relative bg-white/2 border border-white/5 p-12 rounded-[3.5rem] transition-all hover:bg-white/5 hover:border-primary/20 hover:-translate-y-2 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={120} /></div>
               <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-3xl flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all">
                  <Cpu size={32} />
               </div>
               <h3 className="text-3xl font-black uppercase italic text-white mb-6 font-heading">DEEP_SCAN</h3>
               <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Cross-referenced structural audits using proprietary algorithms. Zero margin for neural failure.
               </p>
               <div className="mt-10 flex gap-2">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-1 bg-primary/20 rounded-full" />)}
               </div>
            </div>

            {/* Feature 3: Cognitive Link */}
            <div className="group relative bg-white/2 border border-white/5 p-12 rounded-[3.5rem] transition-all hover:bg-white/5 hover:border-primary/20 hover:-translate-y-2 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity"><MessageCircle size={120} /></div>
               <div className="w-20 h-20 bg-zinc-950 border border-white/5 rounded-3xl flex items-center justify-center text-primary mb-10 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all">
                  <Layers size={32} />
               </div>
               <h3 className="text-3xl font-black uppercase italic text-white mb-6 font-heading">COGNITIVE</h3>
               <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Conversational career architecture that extracts and clarifies your professional station logs.
               </p>
               <div className="mt-10 flex items-center justify-between">
                  <span className="text-[0.6rem] font-black text-zinc-600 uppercase tracking-widest">Latency: 0.042ms</span>
                  <div className="flex gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /><div className="w-1 h-1 rounded-full bg-emerald-500" /></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        --- SECTION: ELEVATION_SEQUENCE --- 
        High-fidelity vertical timeline / elevator sequence.
      */}
      <section className="py-40 relative bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            {/* Elevation Tower Visual */}
            <div className="relative h-[600px] flex items-center justify-center border-x border-white/5">
               <div className="absolute inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
               
               <div className="space-y-20 relative z-10 w-full px-12">
                  <div className="flex items-center gap-10 group cursor-default">
                    <span className="text-6xl font-black italic text-zinc-800 group-hover:text-primary transition-colors font-heading">01</span>
                    <div>
                      <h4 className="text-2xl font-black tracking-tight text-white uppercase italic font-heading">INITIALIZE</h4>
                      <p className="text-[0.65rem] font-black text-primary uppercase tracking-[0.4em] mt-1">Boot sequence alpha</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10 group cursor-default ml-12">
                    <span className="text-6xl font-black italic text-zinc-800 group-hover:text-primary transition-colors font-heading">02</span>
                    <div>
                      <h4 className="text-2xl font-black tracking-tight text-white uppercase italic font-heading">ARCHITECT</h4>
                      <p className="text-[0.65rem] font-black text-primary uppercase tracking-[0.4em] mt-1">Pattern recognition</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10 group cursor-default">
                    <span className="text-6xl font-black italic text-zinc-800 group-hover:text-primary transition-colors font-heading">03</span>
                    <div>
                      <h4 className="text-2xl font-black tracking-tight text-white uppercase italic font-heading">ELEVATE</h4>
                      <p className="text-[0.65rem] font-black text-primary uppercase tracking-[0.4em] mt-1">Full orbital deployment</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Narrative Column */}
            <div className="space-y-10">
              <div className="space-y-4">
                  <span className="text-[0.6rem] font-black text-zinc-600 uppercase tracking-[0.6em] font-heading">DEPLOYMENT_FLOW</span>
                  <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-[0.9] font-heading">
                    ELEVATION <br/> <span className="text-primary not-italic">SEQUENCE.</span>
                  </h2>
              </div>
              <p className="text-xl text-zinc-400 font-bold leading-relaxed italic pr-12">
                A streamlined, vertical pipeline designed for maximum career thrust. We don't just build; we engineer elevations.
              </p>
              <div className="pt-6">
                <Link href={ctaHref}>
                    <button className="h-16 px-12 border-2 border-primary text-primary hover:bg-primary hover:text-white font-black uppercase tracking-[0.4em] text-[0.7rem] rounded-full transition-all saturn-glow active:scale-[0.98] font-heading">
                        INIT_TOTAL_SEQUENCE
                    </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        --- SECTION: STATION_UNIT_COSTS --- 
        The final CTA/Pricing section with massive immersion.
      */}
      <section className="py-60 relative overflow-hidden bg-black">
        {/* Saturn Ring Motif Transition */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[20vh] border-t-[80px] border-primary/5 rounded-[100%] blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center space-y-20">
            <div className="space-y-6">
                <h2 className="text-6xl md:text-[8rem] font-black uppercase italic tracking-[-0.04em] text-white leading-none font-heading">
                    CHOOSE_YOUR <br/> <span className="text-primary not-italic">STATION.</span>
                </h2>
                <p className="text-zinc-500 font-bold tracking-[0.4em] uppercase text-xs">Sector categorization for elite status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="p-16 bg-zinc-950 border border-white/5 rounded-[4rem] text-left group hover:border-zinc-800 transition-all shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5"><Disc size={150} /></div>
                    <span className="text-[0.6rem] font-black text-zinc-600 uppercase tracking-[0.5em] mb-4 block">SECTOR: PILOT (FREE)</span>
                    <h3 className="text-5xl font-black italic text-white mb-10 font-heading">CORE</h3>
                    <ul className="space-y-6 mb-16">
                        {["10 Gravity Credits", "5 Exports", "Core Scan Protocol"].map(f => (
                            <li key={f} className="flex items-center gap-4 text-xs font-black text-zinc-400 uppercase tracking-widest italic">
                                <div className="h-2 w-2 rounded-full bg-primary/40" /> {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/auth/signin">
                        <button className="w-full h-16 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.3em] text-[0.65rem] rounded-full border border-white/5 transition-all outline-none font-heading">
                            LAUNCH_CORE
                        </button>
                    </Link>
                </div>

                <div className="p-16 bg-zinc-950 border border-primary/30 rounded-[4rem] text-left group hover:border-primary/50 transition-all shadow-primary/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
                    <div className="absolute top-0 right-0 p-12 opacity-10 text-primary"><Sparkles size={150} /></div>
                    <span className="text-[0.6rem] font-black text-primary uppercase tracking-[0.5em] mb-4 block">SECTOR: ELITE ($5.00)</span>
                    <h3 className="text-5xl font-black italic text-white mb-10 font-heading">COMMAND</h3>
                    <ul className="space-y-6 mb-16">
                        {["Unlimited Credits", "Infinite Exports", "Deep Scan Audit", "Station Support"].map(f => (
                            <li key={f} className="flex items-center gap-4 text-xs font-black text-white uppercase tracking-widest italic">
                                <div className="h-2 w-2 rounded-full bg-primary" /> {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/auth/signin">
                        <button className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.3em] text-[0.65rem] rounded-full border-none transition-all saturn-glow outline-none font-heading">
                            ELEVATE_COMMAND
                        </button>
                    </Link>
                </div>
            </div>

            {/* Bottom Terminal Footnote */}
            <div className="pt-20 flex flex-col items-center gap-8">
                <div className="flex items-center gap-6 opacity-20">
                    <div className="h-[1px] w-20 bg-white" />
                    <Orbit size={40} className="text-white" />
                    <div className="h-[1px] w-20 bg-white" />
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-800 italic font-heading">THE TERMINAL FOR ELITE STATUS.</h4>
            </div>
        </div>
      </section>

      {/* Final Terminal System Bar */}
      <footer className="py-10 border-t border-white/5 bg-zinc-950 px-6">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-8 text-[0.6rem] font-black uppercase tracking-[0.6em] text-zinc-700 font-heading">
          <div className="flex items-center gap-4 italic shrink-0">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             SYSTEM_STABLE // 0.042MS
          </div>
          <div className="hidden md:block opacity-40">COORDINATES: SATURN_RING_P_4</div>
          <div className="flex items-center gap-10">
            <span className="hover:text-primary cursor-pointer transition-colors">SECURITY_PROTOCOL</span>
            <span className="hover:text-primary cursor-pointer transition-colors">OS_LICENSE</span>
            <span className="text-zinc-500">© 2026 SATURN_AI_CORE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
