'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import useSWR from 'swr';
import { 
  FileText, 
  Clock, 
  Trash2, 
  Coins, 
  ArrowRight, 
  Loader2, 
  Plus, 
  X, 
  Eye, 
  Share2, 
  Sparkles, 
  Copy, 
  Check, 
  BarChart3, 
  Stars,
  Zap,
  Orbit
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const ResumePreview = dynamic(() => import('@/components/ResumePreview'), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" /></div>
});
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ResumeItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </Suspense>
  );
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: resumesData, error: resumesError, mutate: mutateResumes } = useSWR(
    status === 'authenticated' ? '/api/resumes' : null, 
    fetcher,
    { revalidateOnFocus: true }
  );

  const { data: creditsData, error: creditsError, mutate: mutateCredits } = useSWR(
    status === 'authenticated' ? '/api/credits' : null, 
    fetcher
  );

  const resumes: ResumeItem[] = resumesData?.resumes || [];
  const credits: number = creditsData?.balance || 0;
  const transactions: TransactionItem[] = creditsData?.transactions || [];

  const isLoadingData = (!resumesData && !resumesError) || (!creditsData && !creditsError);

  const totalResumes = resumes.length;
  const avgScore = resumes.length > 0 ? 78 : 0; 

  useEffect(() => {
    if (searchParams?.get('purchase') === 'true') {
      setShowPricing(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const [viewingResume, setViewingResume] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [clResumeId, setClResumeId] = useState<string | null>(null);
  const [clJd, setClJd] = useState('');
  const [clLoading, setClLoading] = useState(false);
  const [clResult, setClResult] = useState<string | null>(null);
  const [clCopied, setClCopied] = useState(false);

  const [showPricing, setShowPricing] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setPurchaseLoading(packageId);
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();

      if (!data.id) {
        toast.error(data.error || 'Failed to start checkout');
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'SATURN AI',
        description: 'Gravity Unit Deployment',
        order_id: data.id,
        handler: async function (response: any) {
             setPurchaseLoading(packageId);
             try {
                const verifyRes = await fetch('/api/razorpay/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        tokens: data.tokens 
                    }),
                });
                
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    toast.success('Payment successful! Gravity added to your account.');
                    setShowPricing(false);
                    mutateCredits();
                } else {
                    toast.error('Payment Verification Failed: ' + verifyData.error);
                }
             } catch (err) {
                 toast.error('Error verifying payment.');
             } finally {
                 setPurchaseLoading(null);
             }
        },
        modal: {
             ondismiss: function() {
                 setPurchaseLoading(null);
                 toast.info('Payment cancelled.');
             }
         },
        prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
        },
        theme: {
            color: '#0f172a',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (err) {
      toast.error('Network error while starting checkout.');
    } finally {
      if (document.querySelector('.razorpay-container')) {
         setPurchaseLoading(null); 
      }
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/resumes?id=${deleteConfirmId}`, { method: 'DELETE' });
      if (res.ok) {
        mutateResumes();
        setDeleteConfirmId(null);
        toast.success('Resume deleted successfully.');
      }
    } catch {
      toast.error('Failed to delete resume');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalLoading(true);
    try {
      const res = await fetch(`/api/resumes?id=${id}`);
      if (res.ok) {
        const responseData = await res.json();
        const resume = responseData.resume;
        setViewingResume(resume);
      } else {
        toast.error('Failed to load resume.');
      }
    } catch {
      toast.error('Error loading resume.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!clResumeId) return;
    setClLoading(true);
    try {
      const res = await fetch(`/api/resumes/${clResumeId}/cover-letter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: clJd }),
      });
      const data = await res.json();
      if (res.ok && data.coverLetter) {
        setClResult(data.coverLetter);
        setClResumeId(null); 
        mutateResumes();
        mutateCredits();
        toast.success('Cover letter generated!');
      } else {
        toast.error(data.error || 'Failed to generate cover letter.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setClLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && isLoadingData)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="container mx-auto px-6 py-12 md:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.05em] flex items-center gap-5 text-white italic uppercase leading-none text-glow font-heading">
              ELEVATION <span className="text-primary not-italic tracking-normal">HANGAR</span> <div className="p-3 bg-primary/10 rounded-full border border-primary/20"><Orbit className="text-primary w-8 h-8 animate-[slow-rotate_10s_linear_infinite]" /></div>
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[0.6rem]">Sector: {session?.user?.name?.split(' ')[0]} {"//"} Status: {credits} Gravity Available</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" onClick={() => setShowPricing(true)} className="font-black uppercase tracking-widest text-[0.6rem] border-white/10 h-14 px-8 hover:bg-white/5 transition-all rounded-full bg-transparent text-white">
                <Plus size={14} className="mr-2 text-primary" /> Acquire Gravity
             </Button>
             <Link href="/builder">
                <Button className="font-black uppercase tracking-widest text-[0.6rem] h-14 px-10 shadow-2xl hover:scale-105 transition-all rounded-full bg-primary hover:bg-primary/90 saturn-glow text-white border-none">
                  <Plus size={16} className="mr-2" /> Initialize Build
                </Button>
             </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <Card className="orbital-glass border-white/5 p-8 rounded-[2.5rem] group hover:border-white/10 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-zinc-800 rounded-2xl text-zinc-400 group-hover:text-white transition-colors"><FileText size={20} /></div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500">Global Records</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-6xl font-black text-white italic leading-none">{totalResumes}</div>
                <div className="pb-1 text-[0.7rem] font-black uppercase tracking-widest text-zinc-600">Profiles</div>
              </div>
              <div className="mt-8 flex items-center gap-2">
                <div className="h-1 w-12 bg-zinc-800 rounded-full" />
                <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-zinc-700">Cloud Storage Sync: Active</span>
              </div>
           </Card>

           <Card className="orbital-glass border-primary/20 p-8 rounded-[2.5rem] group relative overflow-hidden transition-all duration-500 shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none animate-[slow-rotate_20s_linear_infinite]"><Orbit size={120} className="text-primary" /></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Coins size={20} /></div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-primary/80">Gravity Level</span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <div className="text-6xl font-black text-primary italic leading-none text-glow">{credits}</div>
                <div className="pb-1 text-[0.7rem] font-black uppercase tracking-widest text-primary/60">Units</div>
              </div>
              <div className="mt-8 flex items-center gap-2 relative z-10">
                <div className="h-1 w-20 bg-primary/20 rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-2/3 animate-[pulse_2s_infinite]" />
                </div>
                <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-primary/40">Atomic Stability: 100%</span>
              </div>
           </Card>

           <Card className="orbital-glass border-white/5 p-8 rounded-[2.5rem] group hover:border-emerald-500/20 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><BarChart3 size={20} /></div>
                <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-emerald-500/60">Average Integrity</span>
              </div>
              <div className="flex items-end gap-3">
                <div className="text-6xl font-black text-emerald-500 italic leading-none text-glow">{avgScore}%</div>
                <div className="pb-1 text-[0.7rem] font-black uppercase tracking-widest text-emerald-500/40">Audit Score</div>
              </div>
              <div className="mt-8 space-y-3">
                 <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${avgScore}%` }} />
                 </div>
                 <span className="text-[0.5rem] font-black uppercase tracking-[0.2em] text-zinc-700 block text-right">Target Delta: +12%</span>
              </div>
           </Card>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-2xl font-black tracking-[-0.02em] mb-8 flex items-center gap-4 italic uppercase text-white font-heading">
              <Clock size={20} className="text-primary" /> ACTIVE CONFIGURATIONS
            </h3>
            
            {resumes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 px-10 rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-3xl text-center space-y-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center shadow-2xl relative z-10 border border-white/10 group-hover:border-primary/40 transition-all duration-500">
                    <FileText className="text-zinc-500 group-hover:text-primary transition-colors" size={40} />
                  </div>
                  <div className="relative z-10 max-w-sm">
                    <h4 className="font-black text-2xl uppercase italic tracking-tighter text-white">Observatory Empty</h4>
                    <p className="text-zinc-500 text-sm mt-3 font-medium leading-relaxed">Your professional trajectory hasn't been mapped yet. Initialize your first neural build to begin.</p>
                  </div>
                  <Link href="/builder" className="relative z-10">
                    <Button className="font-black uppercase tracking-widest text-[0.65rem] h-14 px-12 bg-primary hover:bg-primary/90 saturn-glow text-white rounded-full">Initialize System</Button>
                  </Link>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumes.map((resume: any) => (
                  <Card key={resume.id} className="group relative orbital-glass border-white/5 hover:border-primary/40 transition-all duration-500 overflow-hidden rounded-[2.5rem] flex flex-col h-full hover:shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-0 right-0 p-8 text-[0.5rem] font-black uppercase tracking-[0.4em] text-zinc-800 group-hover:text-primary/20 transition-colors pointer-events-none">MOD_v01.4</div>
                    <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between space-y-0">
                      <div className="flex flex-col gap-6">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-all duration-500 border border-white/5">
                          <FileText size={32} />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white line-clamp-1">{resume.title || 'Untitled Configuration'}</CardTitle>
                          <div className="flex items-center gap-3 mt-3">
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                <Clock size={10} className="text-zinc-500" />
                                <span className="text-[0.55rem] font-black uppercase tracking-widest text-zinc-400">{new Date(resume.updatedAt).toLocaleDateString()}</span>
                             </div>
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <Check size={10} className="text-emerald-500" />
                                <span className="text-[0.55rem] font-black uppercase tracking-widest text-emerald-500">SYNCED</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <div className="px-8 mt-10 grid grid-cols-3 gap-2">
                       <Button variant="ghost" size="icon" onClick={(e) => handleViewResume(resume.id, e)} className="h-12 w-full rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                          {modalLoading ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Eye size={18} />}
                       </Button>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-full rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/r/${resume.id}`;
                            navigator.clipboard.writeText(url);
                            setCopiedId(resume.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                        >
                          {copiedId === resume.id ? <Check size={16} className="text-emerald-500" /> : <Share2 size={18} />}
                       </Button>
                       <Button variant="ghost" size="icon" onClick={(e) => handleDelete(resume.id, e)} className="h-12 w-full rounded-2xl bg-red-500/5 hover:bg-red-500/20 text-zinc-600 hover:text-red-500 transition-all">
                          <Trash2 size={18} />
                       </Button>
                    </div>
                    <CardContent className="p-8 pt-4 flex gap-3 mt-4">
                       <Link href={`/builder?id=${resume.id}`} className="flex-1">
                          <Button className="w-full h-12 rounded-2xl bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-widest text-[0.6rem] hover:bg-white/5 transition-all">
                             ENTER TERMINAL
                          </Button>
                       </Link>
                       <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setClResumeId(resume.id);
                            setClJd('');
                          }}
                          className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center p-0"
                        >
                          <Sparkles size={18} />
                       </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
             <Card className="orbital-glass rounded-[2.5rem] border-primary/20 saturn-glow group overflow-hidden relative p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity animate-[slow-rotate_20s_linear_infinite]"><Orbit size={100} className="text-primary" /></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap size={22} className="text-primary animate-pulse" />
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-white italic">Atmospheric Surge</span>
                  </div>
                  
                  <div className="mb-10">
                    <div className="flex items-baseline gap-2 tracking-tighter text-white font-black font-heading">
                      <span className="text-7xl text-primary italic">₹5</span>
                      <span className="text-zinc-500 uppercase text-[0.6rem] tracking-[0.5em] font-black">UNITS</span>
                    </div>
                    <p className="text-zinc-500 font-bold text-[0.6rem] uppercase tracking-widest mt-4 leading-relaxed">Acquire raw gravity to propel your profile into the next orbit.</p>
                  </div>

                  <Button onClick={() => setShowPricing(true)} className="w-full h-16 font-black uppercase tracking-[0.3em] text-[0.65rem] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-2xl border-none rounded-full saturn-glow group">
                     <span className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">Initialize Acquisition <ArrowRight size={14} /></span>
                  </Button>
                </div>
             </Card>

             <Card className="orbital-glass rounded-[2rem] border-white/5 p-8 group overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles size={18} className="text-primary" />
                  <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500">Intelligence Brief</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                  "The <span className="text-primary font-black italic underline decoration-primary/30">XYZ PROTOCOL</span> is now active in our cognitive engine. Deployments using this logic see 4x higher validation rates."
                </p>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                   <span className="text-[0.5rem] font-black uppercase tracking-widest text-zinc-600">Source: Saturn AI Labs</span>
                   <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                   </div>
                </div>
             </Card>

             {transactions.length > 0 && (
                <Card className="orbital-glass rounded-[2rem] border-white/5 overflow-hidden">
                   <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                       <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500">Station Logs</span>
                       <Clock size={14} className="text-zinc-700" />
                   </div>
                   <div className="divide-y divide-white/5">
                      {transactions.slice(0, 3).map(tx => (
                         <div key={tx.id} className="flex items-center justify-between p-6 px-8 hover:bg-white/5 transition-colors">
                            <div className="flex flex-col">
                               <span className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-300 truncate max-w-[150px]">{tx.description}</span>
                               <span className="text-[0.5rem] font-bold text-zinc-600 uppercase mt-1">Status: Finalized</span>
                            </div>
                            <span className={`text-sm font-black italic ${tx.amount > 0 ? 'text-emerald-500' : 'text-zinc-400'}`}>
                               {tx.amount > 0 ? '+' : ''}{tx.amount}G
                            </span>
                         </div>
                      ))}
                   </div>
                </Card>
             )}
          </div>
        </div>
      </div>

      {/* Modals Section */}
      
      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 z-[1000] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
          <Card className="w-full max-w-4xl orbital-glass border-white/5 overflow-hidden rounded-[3rem] shadow-[-20px_40px_100px_rgba(0,0,0,0.8)]">
            <div className="relative p-12 pb-10 border-b border-white/5 bg-black/60 shadow-2xl">
              <Button variant="ghost" size="icon" className="absolute top-8 right-8 h-12 w-12 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all z-20" onClick={() => setShowPricing(false)}>
                <X className="h-8 w-8" />
              </Button>
              <div className="text-center space-y-4">
                 <h2 className="text-6xl md:text-7xl font-black italic tracking-[-0.05em] uppercase text-white font-heading">GATHER <span className="text-primary not-italic">GRAVITY</span></h2>
                 <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[0.65rem] italic">Aquire propulsion units for your next career elevation.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 bg-zinc-950/50">
              {[
                { id: 'starter', name: 'Standard', tokens: 50, price: '₹5', desc: 'Single build propulsion' },
                { id: 'professional', name: 'Propulsor', tokens: 200, price: '₹15', desc: 'Rapid deployment array', featured: true },
                { id: 'elite', name: 'Command', tokens: 500, price: '₹30', desc: 'Unlimited orbital reach' },
              ].map(pkg => (
                <div 
                  key={pkg.id} 
                  className={`relative flex flex-col p-12 rounded-[3.5rem] border-2 transition-all hover:scale-[1.02] duration-500 group overflow-hidden ${pkg.featured ? 'border-primary bg-primary/5 shadow-[0_0_80px_rgba(var(--primary-rgb),0.15)] ring-1 ring-primary/20' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                >
                  {pkg.featured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-black text-[0.6rem] font-black px-8 py-2.5 rounded-full uppercase tracking-[0.3em] shadow-2xl z-20 whitespace-nowrap -mt-0.5">
                      Tactical Choice
                    </div>
                  )}
                  
                  <div className="relative z-10 flex-1">
                    <h4 className="font-black text-3xl mb-3 italic uppercase tracking-tighter text-white font-heading">{pkg.name}</h4>
                    <div className="flex items-baseline gap-2 mb-10">
                       <div className="text-6xl font-black text-white tracking-tighter font-heading">{pkg.price}</div>
                       <div className="text-[0.65rem] font-black text-zinc-600 uppercase tracking-widest leading-none">Initial_Fee</div>
                    </div>
                    
                    <div className="space-y-5 mb-12 pb-10 border-b border-white/5">
                      <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[0.7rem] italic">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" /> {pkg.tokens} Gravity Units
                      </div>
                      <p className="text-[0.7rem] text-zinc-500 font-bold leading-relaxed uppercase tracking-widest italic">{pkg.desc}</p>
                    </div>
                  </div>

                  <Button 
                    className={`relative z-10 w-full h-16 font-black uppercase tracking-[0.4em] text-[0.7rem] rounded-full transition-all italic ${pkg.featured ? 'bg-primary text-black saturn-glow shadow-primary/40 hover:bg-white overflow-hidden' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white shadow-xl'}`} 
                    disabled={!!purchaseLoading}
                    onClick={() => handlePurchase(pkg.id)}
                  >
                    {purchaseLoading === pkg.id ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Initialize'}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="p-10 bg-black/60 border-t border-white/5 text-center flex flex-col items-center gap-4">
               <div className="h-[1px] w-20 bg-white/5" />
               <p className="text-[0.55rem] font-black text-zinc-800 uppercase tracking-[0.6em] italic">Secure Terminal • Powered by Razorpay SSL Encryption</p>
            </div>
          </Card>

        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1100] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4">
           <Card className="w-full max-w-md orbital-glass border-red-500/20 shadow-[0_0_100px_rgba(239,68,68,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 rounded-[3rem]">
              <div className="bg-red-500/5 border-b border-white/5 p-12 text-center">
                 <div className="mx-auto w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 border border-red-500/20 animate-pulse">
                    <Trash2 size={40} />
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter italic uppercase text-white font-heading">Terminate Build?</h3>
                 <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-red-500 mt-4">Permanent Neural Deletion Imminent</p>
              </div>
              <div className="p-10 flex gap-4 bg-black/40">
                 <Button variant="outline" className="flex-1 font-black uppercase tracking-widest text-[0.6rem] border-white/10 h-14 rounded-full text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => setDeleteConfirmId(null)} disabled={deleteLoading}>Aabort</Button>
                 <Button className="flex-1 font-black uppercase tracking-widest text-[0.6rem] h-14 shadow-2xl bg-red-600 hover:bg-red-500 text-white rounded-full border-none" onClick={confirmDelete} disabled={deleteLoading}>
                   {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Deletion'}
                 </Button>
              </div>
           </Card>
        </div>
      )}

      {/* Preview Modal */}
      {viewingResume && (
        <div className="fixed inset-0 z-[1200] bg-zinc-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
          <div className="w-full max-w-7xl h-full orbital-glass border-white/5 rounded-[4rem] shadow-[-50px_100px_150px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-10 px-12 border-b border-white/5 bg-black/40">
               <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                     <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl italic uppercase tracking-[-0.05em] text-white font-heading">CONFIGURATION <span className="text-primary not-italic">PREVIEW</span></h3>
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500 mt-2">Observatory Mode Active</p>
                  </div>
               </div>
               <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full hover:bg-white/5 border border-white/10 transition-all hover:scale-110" onClick={() => setViewingResume(null)}>
                 <X className="h-8 w-8 text-zinc-400" />
               </Button>
            </div>
            <div className="flex-1 overflow-auto bg-black/60 p-8 md:p-16 custom-scrollbar relative">
                {/* Visual texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.02),transparent)] pointer-events-none" />
                <div className="relative z-10 mx-auto max-w-[900px]">
                  <ResumePreview 
                    resumeMarkdown={viewingResume.markdown || "# Generated"} 
                    resumeData={viewingResume.data}
                    onResumeChange={() => {}}
                    className="shadow-[0_40px_100px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/5"
                  />
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter Modal */}
      {clResumeId && (
        <div className="fixed inset-0 z-[1300] bg-zinc-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
          <Card className="w-full max-w-2xl orbital-glass border-white/5 overflow-hidden rounded-[3rem] shadow-2xl">
            <div className="relative p-12 pb-8 border-b border-white/5 bg-black/40 text-center">
              <Button variant="ghost" size="icon" className="absolute top-8 right-8 h-12 w-12 rounded-full hover:bg-white/5 text-zinc-500" onClick={() => setClResumeId(null)}>
                <X className="h-6 w-6" />
              </Button>
              <h2 className="text-3xl font-black italic tracking-tight uppercase text-white font-heading">PITCH <span className="text-primary not-italic">TAILORING</span></h2>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500 mt-4 leading-relaxed">Customize your satellite transmission for specific targets.</p>
            </div>
            <div className="p-12">
              <textarea
                value={clJd}
                onChange={e => setClJd(e.target.value)}
                className="w-full min-h-[300px] p-8 rounded-[2rem] border border-white/10 bg-black/60 text-sm mb-10 focus:outline-none focus:border-primary/50 transition-all font-medium custom-scrollbar text-white placeholder:text-zinc-700"
                placeholder="Paste the Job Description protocol here..."
              />
              <Button onClick={handleGenerateCoverLetter} disabled={clLoading} className="w-full h-16 font-black uppercase tracking-[0.3em] text-[0.65rem] bg-primary text-white saturn-glow rounded-full shadow-2xl transition-all active:scale-95">
                {clLoading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Synchronizing...</> : <><Sparkles className="mr-3 h-5 w-5 animate-pulse" /> Initialize Generation</>}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Cover Letter Result Modal */}
      {clResult && (
        <div className="fixed inset-0 z-[1400] bg-zinc-950/98 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
          <Card className="w-full max-w-3xl h-[85vh] orbital-glass border-white/5 overflow-hidden rounded-[4rem] flex flex-col shadow-2xl">
            <div className="relative p-12 pb-8 border-b border-white/5 bg-black/40 flex-shrink-0 text-center">
              <Button variant="ghost" size="icon" className="absolute top-8 right-8 h-12 w-12 rounded-full hover:bg-white/5 text-zinc-500" onClick={() => { setClResult(null); setClCopied(false); }}>
                <X className="h-6 w-6" />
              </Button>
              <h2 className="text-3xl font-black italic tracking-tight uppercase text-white font-heading">GENERATED <span className="text-primary not-italic">MANIFESTO</span></h2>
              <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500 mt-4">Optimized Narrative Response Protocol</p>
            </div>
            <CardContent className="flex-1 overflow-y-auto p-12 font-medium leading-[1.8] text-zinc-300 custom-scrollbar whitespace-pre-wrap text-sm">
              {clResult}
            </CardContent>
            <div className="p-12 pt-8 border-t border-white/5 bg-black/40 flex-shrink-0">
              <Button onClick={() => { navigator.clipboard.writeText(clResult); setClCopied(true); setTimeout(() => setClCopied(false), 2000); }} className="w-full h-16 font-black uppercase tracking-[0.3em] text-[0.65rem] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-2xl rounded-full saturn-glow">
                {clCopied ? <><Check className="mr-3 h-5 w-5" /> Transmission Captured</> : <><Copy className="mr-3 h-5 w-5" /> Copy Manifest</>}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
