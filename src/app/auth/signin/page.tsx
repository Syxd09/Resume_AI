'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, Sparkles, ArrowRight, User, Github, Linkedin, ChevronLeft, Orbit } from 'lucide-react';
import { useMousePosition } from '@/hooks/useMousePosition';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile 
} from 'firebase/auth';

type Tab = 'signin' | 'register';

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const mouse = useMousePosition();
  const bgRef = useRef<HTMLDivElement>(null);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // 2. Sign in to NextAuth with the Firebase ID Token
      const result = await signIn('credentials', {
        redirect: false,
        idToken,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      console.error('[SignIn] Error:', err);
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with name if provided
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      const idToken = await userCredential.user.getIdToken();

      // 2. Sign in to NextAuth with the Firebase ID Token
      const result = await signIn('credentials', {
        redirect: false,
        idToken,
      });

      if (result?.error) {
        setError('Account created! Please sign in.');
        setTab('signin');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      console.error('[Register] Error:', err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (providerName: string) => {
    if (providerName === 'google') {
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        const nextAuthResult = await signIn('credentials', {
          redirect: false,
          idToken,
        });

        if (nextAuthResult?.error) {
          setError('Authentication failed.');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } catch (err: any) {
        console.error('[OAuth] Error:', err);
        setError(err.message || 'OAuth failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // For other providers (GitHub, LinkedIn), use standard NextAuth if configured
      signIn(providerName, { callbackUrl: '/dashboard' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden bg-zinc-950 text-zinc-50">
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen"
        style={{
          background: `radial-gradient(1000px circle at ${mouse.x}px ${mouse.y}px, rgba(var(--primary-rgb), 0.2), transparent 70%), radial-gradient(800px circle at ${mouse.x + 200}px ${mouse.y - 200}px, rgba(245, 158, 11, 0.1), transparent 60%)`
        }}
      />
      
      {/* Saturn Ring Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[50vh] border-y-[2px] border-primary/20 rounded-[100%] rotate-[-15deg] pointer-events-none opacity-40 z-0">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-3xl" />
         <div className="absolute inset-0 border-y border-amber-500/10 rounded-[100%] scale-[0.98]" />
      </div>

      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0" />
      
      <Link href="/" className="absolute top-8 left-8 z-10 hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity text-white hover:text-primary">
        <ChevronLeft size={16} className="text-primary" /> Return to Orbit
      </Link>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="orbital-glass border-white/5 rounded-[3rem] p-10 md:p-14 saturn-glow transition-all animate-in fade-in zoom-in duration-700">
          
          {/* Logo & Branding */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-full flex items-center justify-center text-primary mb-8 shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] border border-primary/40 relative overflow-hidden group">
              <div className="absolute inset-0 border-[4px] border-amber-500/20 rounded-full animate-[slow-rotate_12s_linear_infinite] group-hover:border-amber-400/40" />
              <div className="absolute inset-3 border-[1px] border-primary/40 rounded-full animate-[slow-rotate_8s_linear_infinite_reverse]" />
              <Orbit size={56} className="animate-pulse drop-shadow-[0_0_20px_rgba(var(--primary-rgb),1)]" />
            </div>
            <h1 className="text-5xl font-black tracking-[-0.08em] uppercase italic text-white leading-none text-glow">SATURN<span className="text-primary tracking-normal not-italic">AI</span></h1>
            <p className="text-amber-500/60 text-[0.6rem] font-black mt-5 tracking-[0.4em] uppercase">Cognitive Career Intelligence</p>
          </div>

          {/* Tab Switch */}
          <div className="flex p-1.5 bg-black/60 rounded-2xl mb-10 border border-amber-500/10 backdrop-blur-md">
            <button 
              type="button" 
              className={`flex-1 flex items-center justify-center py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${tab === 'signin' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              onClick={() => { setTab('signin'); setError(''); }}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`flex-1 flex items-center justify-center py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all ${tab === 'register' ? 'bg-primary text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              onClick={() => { setTab('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-4 mb-8 text-xs font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
               <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {error}
            </div>
          )}

          <form onSubmit={tab === 'signin' ? handleSignIn : handleRegister} className="space-y-6">
            {tab === 'register' && (
              <div className="space-y-2">
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.3em] opacity-40 ml-2">Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-primary focus:bg-black/60 transition-all outline-none" 
                    placeholder="Full Identity Name" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.3em] opacity-40 ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-primary focus:bg-black/60 transition-all outline-none focus:shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]" 
                  placeholder="comm_link@saturn.ai" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.3em] opacity-40 ml-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl h-14 pl-12 pr-4 text-sm font-medium text-white placeholder:text-zinc-600 focus:border-primary focus:bg-black/60 transition-all outline-none" 
                  placeholder="••••••••" 
                  required 
                  minLength={tab === 'signin' ? 4 : 6}
                />
              </div>
            </div>

            {tab === 'register' && (
              <div className="space-y-2">
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.3em] opacity-40 ml-2">Verify Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/20 border-2 border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-medium focus:border-primary focus:bg-black/40 transition-all outline-none" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[0.7rem] saturn-glow transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 border-none group"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Orbiting...</> : <>
                <span className="group-hover:translate-x-1 transition-transform flex items-center gap-3">
                  {tab === 'signin' ? 'Initialize Session' : 'Create Intelligence'} <ArrowRight size={18} />
                </span>
              </>}
            </button>
          </form>

          {/* OAuth Divider */}
          <div className="relative my-10 flex items-center">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 text-[0.6rem] font-black uppercase tracking-[0.4em] opacity-30">Neural Bridge</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => handleOAuth('google')} className="h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center transition-all group">
              <svg viewBox="0 0 24 24" width="20" height="20" className="group-hover:scale-110 transition-transform"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.32-2.23 4.41-1.03.85-2.67 1.63-5.61 1.63-5.5 0-9.91-4.48-9.91-9.96s4.41-9.96 9.91-9.96c2.97 0 5.2 1.14 6.8 2.67l2.23-2.22C19.11 1.95 16.03.5 12.48.5 5.86.5.5 5.88.5 12.5s5.36 12 11.98 12c3.54 0 6.22-1.17 8.35-3.37 2.22-2.2 2.91-5.32 2.91-7.85 0-.75-.07-1.46-.21-2.07h-11.05z"/></svg>
            </button>
            <button onClick={() => handleOAuth('github')} className="h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center transition-all group">
              <Github size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => handleOAuth('linkedin')} className="h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center transition-all group">
              <Linkedin size={20} style={{ color: '#0077b5' }} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <p className="mt-12 text-center text-[0.65rem] font-black uppercase tracking-widest opacity-30">
            Secure multi-factor authentication active.
          </p>
        </div>
        
        <p className="mt-8 text-center text-xs font-medium text-zinc-500">
          New deployments receive <span className="text-primary font-black uppercase tracking-tighter italic">10 Free Credits</span> to initialize.
        </p>
      </div>
    </div>
  );
}
