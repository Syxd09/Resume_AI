import React from 'react';
import { Trash2, Plus, X, Loader2, Sparkles, ChevronUp, ChevronDown, Building2 } from 'lucide-react';
import { DebouncedInput } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';
import { WorkEntry } from '@/types/resume';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface ExperienceCardProps {
  entry: WorkEntry;
  idx: number;
  totalEntries: number;
  bulletLoading: string | null;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof WorkEntry, value: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onUpdateBullet: (id: string, bulletIndex: number, value: string) => void;
  onRemoveBullet: (id: string, bulletIndex: number) => void;
  onAddBullet: (id: string) => void;
  onRewriteBullets: (id: string, entry: WorkEntry) => void;
  onGenerateRoleBullets: (id: string, title: string) => void;
}

export function ExperienceCard({
  entry,
  idx,
  totalEntries,
  bulletLoading,
  onRemove,
  onUpdate,
  onMove,
  onUpdateBullet,
  onRemoveBullet,
  onAddBullet,
  onRewriteBullets,
  onGenerateRoleBullets,
}: ExperienceCardProps) {
  return (
    <div className="group relative rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10 shadow-2xl">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-white/[0.01]">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden">
             <Building2 size={24} />
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
           </div>
           <div>
             <h3 className="text-[0.8rem] font-black uppercase tracking-[0.3em] font-heading text-white">{entry.jobTitle || 'NEW_DESIGNATION'}</h3>
             <p className="text-[0.6rem] font-bold text-zinc-500 uppercase tracking-widest mt-1">{entry.company || 'UNASSOCIATED_CORP_ENTITY'}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          {totalEntries > 1 && (
            <div className="flex items-center bg-zinc-950/40 rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => onMove(entry.id, 'up')}
                disabled={idx === 0}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronUp size={18} />
              </button>
              <div className="w-[1px] h-4 bg-white/5" />
              <button
                type="button"
                onClick={() => onMove(entry.id, 'down')}
                disabled={idx === totalEntries - 1}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(entry.id)}
            className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">DESIGNATION</label>
            <DebouncedInput
              type="text"
              value={entry.jobTitle}
              onChangeValue={(val) => onUpdate(entry.id, 'jobTitle', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="e.g. SYSTEMS_ARCHITECT"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">CORP_ENTITY</label>
            <DebouncedInput
              type="text"
              value={entry.company}
              onChangeValue={(val) => onUpdate(entry.id, 'company', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="e.g. NEXUS_RESOURCES"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">START_CHRONO</label>
            <DebouncedInput
              type="text"
              value={entry.startDate}
              onChangeValue={(val) => onUpdate(entry.id, 'startDate', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800 uppercase"
              placeholder="JAN 2022"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">END_CHRONO</label>
            <DebouncedInput
              type="text"
              value={entry.endDate}
              onChangeValue={(val) => onUpdate(entry.id, 'endDate', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800 uppercase"
              placeholder="PRESENT"
              delay={250}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-400">MISSION_PARAMETERS (ACHIEVEMENTS)</span>
            <div className="flex gap-4">
               <button 
                  type="button" 
                  onClick={() => onRewriteBullets(entry.id, entry)}
                  disabled={bulletLoading === entry.id}
                  className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[0.5rem] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {bulletLoading === entry.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                  REWRITE_XYZ
                </button>
                <button 
                  type="button" 
                  onClick={() => onGenerateRoleBullets(entry.id, entry.jobTitle)}
                  disabled={bulletLoading === entry.id + '_generate' || !entry.jobTitle}
                  className="px-4 py-1.5 bg-white/5 border border-white/10 text-zinc-400 rounded-lg text-[0.5rem] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {bulletLoading === entry.id + '_generate' ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
                  GEN_IDEAS
                </button>
            </div>
          </div>

          <div className="space-y-4">
            {entry.bullets.map((b, bi) => (
              <div key={bi} className="flex gap-4 group/bullet">
                <div className="pt-4 flex flex-col items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/bullet:bg-primary transition-colors" />
                   <div className="w-[1px] flex-1 bg-white/5" />
                </div>
                <div className="flex-1 relative">
                  <DebouncedInput
                    type="text"
                    value={b}
                    onChangeValue={(val) => onUpdateBullet(entry.id, bi, val)}
                    className="w-full bg-white/2 border border-white/5 rounded-xl px-6 py-4 text-sm focus:border-primary/20 transition-all outline-none font-medium placeholder:text-zinc-800 leading-relaxed"
                    placeholder="Enter mission achievement protocol..."
                    delay={150}
                  />
                  {entry.bullets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveBullet(entry.id, bi)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-red-400 opacity-0 group-hover/bullet:opacity-100 transition-all"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onAddBullet(entry.id)}
            className="flex items-center gap-3 text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-primary transition-all ml-6"
          >
            <Plus size={12} /> ADD_PARAMETER_NODE
          </button>
        </div>
      </div>
    </div>

  );
}
