'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Menu, X, ChevronRight, Orbit } from 'lucide-react';
import UserMenu from './UserMenu';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/builder', label: 'Builder' },
  { href: '/dashboard', label: 'My Resumes' },
  { href: '/ats-tracker', label: 'ATS Tracker' },
  { href: '/jobs', label: 'Job Section' },
];

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth')) return null;

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-white/5 bg-background/40 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-10">
        <Link href="/" className="flex items-center gap-6 transition-all hover:scale-105 group relative">
          <div className="relative flex h-16 w-16 items-center justify-center">
            {/* Saturn Ring - Elegant horizontal ellipse */}
            <div className="absolute w-[140%] h-[30%] border-[3px] border-primary/60 rounded-[100%] rotate-[-15deg] shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] animate-[pulse_4s_ease-in-out_infinite]" />
            
            {/* Planet Body */}
            <div className="relative z-10 h-10 w-10 bg-gradient-to-br from-primary via-primary/80 to-accent rounded-full shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] flex items-center justify-center overflow-hidden">
               {/* Surface texture/glow */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
               <Orbit size={24} className="text-white/90 animate-[spin_10s_linear_infinite]" />
            </div>

            {/* Sub-rings for depth */}
            <div className="absolute w-[110%] h-[20%] border border-primary/20 rounded-[100%] rotate-[-15deg] opacity-50" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-4xl font-black tracking-[-0.1em] uppercase leading-none text-white relative group-hover:text-primary transition-colors font-heading">
              SATURN <span className="text-primary not-italic tracking-normal">AI</span>
              <span className="absolute -inset-1 bg-primary/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
              {/* Glint effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-[glint_3s_linear_infinite] pointer-events-none" />
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-[2px] w-6 bg-gradient-to-r from-primary to-transparent" />
              <span className="text-[0.5rem] font-black uppercase tracking-[0.5em] text-zinc-500 group-hover:text-primary/70 transition-colors">Career Observatory</span>
            </div>
          </div>
        </Link>

        {session && (
          <nav className={`md:flex items-center gap-12 ${mobileOpen ? 'absolute top-20 left-0 w-full flex-col bg-zinc-950/98 backdrop-blur-3xl p-10 border-b border-white/10 shadow-2xl md:static md:w-auto md:p-0 md:bg-transparent md:border-none md:shadow-none animate-in slide-in-from-top-6 duration-500' : 'hidden'}`}>
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className={`relative text-[0.65rem] font-black uppercase tracking-[0.35em] transition-all py-2 group ${isActive ? 'text-primary' : 'text-zinc-400 hover:text-white'}`}
                  onClick={() => setMobileOpen(false)}>
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-[3px] bg-primary transition-all duration-500 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-6">
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-white/10" />
          </div>
          
          {session ? (
            <>
              <UserMenu />
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="lg" className="h-12 px-10 bg-primary hover:bg-primary/95 text-white font-black uppercase tracking-widest text-[0.65rem] rounded-full transition-all shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/50 group border-none">
                <span className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">Elevate Professional Status <ChevronRight size={14} /></span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
