import React, { memo } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { EducationEntry } from '@/types/resume';
import { EducationCard } from './cards/EducationCard';
import { Accordion } from '@/components/ui/accordion';

interface Props {
  education: EducationEntry[];
  updateEducation: any;
  moveEducation: any;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  handleSuggestCoursework?: (eduId: string, degree: string) => void;
  loadingSuggestion?: string | null;
}

export const EducationSection = memo(function EducationSection({
  education,
  updateEducation,
  moveEducation,
  addEducation,
  removeEducation,
  handleSuggestCoursework,
  loadingSuggestion,
}: Props) {

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {education.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center gap-6 bg-white/2 rounded-[3rem] border border-dashed border-white/10 group hover:border-primary/30 transition-all shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 group-hover:text-primary/40 transition-colors">
            <GraduationCap size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-400">FOUNDATION_MISSING</p>
            <p className="text-[0.65rem] text-zinc-600 font-medium uppercase tracking-[0.1em] max-w-[200px]">Academic credentials required for cognitive verification.</p>
          </div>
        </div>
      )}
      
      {education.length > 0 && (
        <div className="space-y-6">
          {education.map((edu, idx) => (
            <EducationCard 
              key={edu.id}
              edu={edu}
              idx={idx}
              totalEntries={education.length}
              onRemove={removeEducation}
              onMove={moveEducation}
              onUpdate={updateEducation as any}
              handleSuggestCoursework={handleSuggestCoursework}
              loadingSuggestion={loadingSuggestion}
            />
          ))}
        </div>
      )}
      
      <button 
        type="button" 
        onClick={addEducation} 
        className="w-full py-6 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/2 text-[0.65rem] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group font-heading shadow-xl active:scale-[0.98]"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
        INIT_ACADEMIC_PROTOCOL
      </button>
    </div>

  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.education) === JSON.stringify(nextProps.education) &&
         prevProps.loadingSuggestion === nextProps.loadingSuggestion;
});
