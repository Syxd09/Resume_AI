import React from 'react';
import { Trash2, ChevronUp, ChevronDown, GraduationCap, Sparkles } from 'lucide-react';
import { DebouncedInput } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';
import { EducationEntry } from '@/types/resume';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface EducationCardProps {
  edu: EducationEntry;
  idx: number;
  totalEntries: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof EducationEntry | 'coursework', value: any) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  handleSuggestCoursework?: (eduId: string, degree: string) => void;
  loadingSuggestion?: string | null;
}

export function EducationCard({
  edu,
  idx,
  totalEntries,
  onRemove,
  onUpdate,
  onMove,
  handleSuggestCoursework,
  loadingSuggestion,
}: EducationCardProps) {
  return (
    <div className="group relative rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10 shadow-2xl">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
      
      <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-white/[0.01]">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 relative overflow-hidden">
             <GraduationCap size={24} />
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent animate-pulse" />
           </div>
           <div>
             <h3 className="text-[0.8rem] font-black uppercase tracking-[0.3em] font-heading text-white">{edu.degree || 'NEW_QUALIFICATION'}</h3>
             <p className="text-[0.6rem] font-bold text-zinc-500 uppercase tracking-widest mt-1">{edu.institution || 'UNVERIFIED_INSTITUTION'}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          {totalEntries > 1 && (
            <div className="flex items-center bg-zinc-950/40 rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => onMove(edu.id, 'up')}
                disabled={idx === 0}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronUp size={18} />
              </button>
              <div className="w-[1px] h-4 bg-white/5" />
              <button
                type="button"
                onClick={() => onMove(edu.id, 'down')}
                disabled={idx === totalEntries - 1}
                className="w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(edu.id)}
            className="w-12 h-12 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">QUALIFICATION_PROTOCOL</label>
            <DebouncedInput
              type="text"
              value={edu.degree}
              onChangeValue={(val) => onUpdate(edu.id, 'degree', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="e.g. B.S._COMPUTER_SCIENCE"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">INSTITUTION_HUB</label>
            <DebouncedInput
              type="text"
              value={edu.institution}
              onChangeValue={(val) => onUpdate(edu.id, 'institution', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="e.g. STANFORD_CENTRAL"
              delay={250}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group/input space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">CHRONO_STAMP (YEAR)</label>
              {edu.year && (edu.year.length !== 4 || isNaN(Number(edu.year))) && (
                <button 
                  type="button"
                  onClick={() => onUpdate(edu.id, 'year', edu.year.replace(/\D/g, '').substring(0, 4))}
                  className="text-[0.45rem] font-black text-primary hover:text-white transition-colors"
                >
                  AUTO_CALIBRATE
                </button>
              )}
            </div>
            <DebouncedInput
              type="text"
              value={edu.year}
              onChangeValue={(val) => onUpdate(edu.id, 'year', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="2020"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">FOUNDATION_INDEX (GPA)</label>
            <DebouncedInput
              type="text"
              value={edu.gpa}
              onChangeValue={(val) => onUpdate(edu.id, 'gpa', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="3.9 / 4.0"
              delay={250}
            />
          </div>
          <div className="group/input space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within/input:text-primary transition-colors">CORE_DISCIPLINES</label>
              {handleSuggestCoursework && (
                <button 
                  type="button"
                  onClick={() => handleSuggestCoursework(edu.id, edu.degree)}
                  disabled={loadingSuggestion === edu.id + '_coursework' || !edu.degree}
                  className="text-[0.5rem] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
                >
                  {loadingSuggestion === edu.id + '_coursework' ? <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> : <Sparkles size={10} />}
                  SCAN_DISCIPLINES
                </button>
              )}
            </div>
            <DebouncedInput
              type="text"
              value={edu.coursework || ''}
              onChangeValue={(val) => onUpdate(edu.id, 'coursework', val)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800"
              placeholder="DATA_STRUCTURES, ML"
              delay={250}
            />
          </div>
        </div>
      </div>
    </div>

  );
}
