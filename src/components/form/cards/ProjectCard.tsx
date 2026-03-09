import React from 'react';
import { Trash2, Loader2, Sparkles, ChevronUp, ChevronDown, FolderGit2 } from 'lucide-react';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';
import { ProjectEntry } from '@/types/resume';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface ProjectCardProps {
  proj: ProjectEntry;
  idx: number;
  totalEntries: number;
  loadingSuggestion: string | null;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof ProjectEntry, value: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onRewriteDesc: (id: string, desc: string) => void;
  onSuggestTechStack: (id: string, desc: string) => void;
}

export function ProjectCard({
  proj,
  idx,
  totalEntries,
  loadingSuggestion,
  onRemove,
  onUpdate,
  onMove,
  onRewriteDesc,
  onSuggestTechStack,
}: ProjectCardProps) {
  return (
    <div className="group relative rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10 shadow-2xl">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
      
      <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-white/[0.01]">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 relative overflow-hidden">
             <FolderGit2 size={24} />
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent animate-pulse" />
           </div>
           <div>
             <h3 className="text-[0.8rem] font-black uppercase tracking-[0.3em] font-heading text-white">{proj.name || 'NEW_SCHEMATIC'}</h3>
             <p className="text-[0.6rem] font-bold text-zinc-500 uppercase tracking-widest mt-1">{proj.techStack || 'UNDEFINED_STACK_MATRIX'}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          {totalEntries > 1 && (
            <div className="flex items-center bg-zinc-950/40 rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => onMove(proj.id, 'up')}
                disabled={idx === 0}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronUp size={18} />
              </button>
              <div className="w-[1px] h-4 bg-white/5" />
              <button
                type="button"
                onClick={() => onMove(proj.id, 'down')}
                disabled={idx === totalEntries - 1}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(proj.id)}
            className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">SCHEMATIC_DESIGNATION</label>
            <DebouncedInput
              type="text"
              value={proj.name}
              onChangeValue={(val) => onUpdate(proj.id, 'name', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="e.g. NEURAL_INTERFACE_V1"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">TECH_STACK_MATRIX</label>
              <button 
                type="button"
                onClick={() => onSuggestTechStack(proj.id, proj.description)}
                disabled={loadingSuggestion === proj.id + '_tech' || !proj.description}
                className="text-[0.5rem] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
              >
                {loadingSuggestion === proj.id + '_tech' ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                INIT_STACK_SCAN
              </button>
            </div>
            <DebouncedInput
              type="text"
              value={proj.techStack}
              onChangeValue={(val) => onUpdate(proj.id, 'techStack', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="e.g. REACT, NEXTJS, TAILWIND"
              delay={250}
            />
          </div>
        </div>

        <div className="group/input space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">TECHNICAL_SPECIFICATIONS (DESCRIPTION)</label>
            <button 
              type="button"
              onClick={() => onRewriteDesc(proj.id, proj.description)}
              disabled={loadingSuggestion === proj.id || !proj.description}
              className="text-[0.5rem] font-black uppercase tracking-widest text-emerald-500/60 hover:text-emerald-500 transition-colors flex items-center gap-2"
            >
              {loadingSuggestion === proj.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              REFORMAT_SPEC_DATA
            </button>
          </div>
          <DebouncedTextarea
            value={proj.description}
            onChangeValue={(val) => onUpdate(proj.id, 'description', val)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm leading-relaxed focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800 shadow-inner min-h-[120px] resize-none"
            rows={3}
            placeholder="Document project architecture and technical achievements..."
            delay={250}
          />
        </div>

        <div className="group/input space-y-3">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">DEPLOYMENT_UPLINK (LINK)</label>
          <DebouncedInput
            type="url"
            value={proj.link}
            onChangeValue={(val) => onUpdate(proj.id, 'link', val)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
            placeholder="https://github.com/archive/blueprint"
            delay={250}
          />
        </div>
      </div>
    </div>

  );
}
