import React, { memo } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { WorkEntry } from '@/types/resume';
import { ExperienceCard } from './cards/ExperienceCard';
import { Accordion } from '@/components/ui/accordion';

interface Props {
  handleRewriteBullets: (id: string, entry: WorkEntry) => void;
  handleGenerateRoleBullets: (id: string, title: string) => void;
  bulletLoading: string | null;
  experience: WorkEntry[];
  updateWork: any;
  moveWork: any;
  addWorkEntry: () => void;
  removeWorkEntry: (id: string) => void;
  updateBullet: any;
  removeBullet: any;
  addBullet: any;
}

export const ExperienceSection = memo(function ExperienceSection({
  handleRewriteBullets,
  handleGenerateRoleBullets,
  bulletLoading,
  experience,
  updateWork,
  moveWork,
  addWorkEntry,
  removeWorkEntry,
  updateBullet,
  removeBullet,
  addBullet
}: {
  handleRewriteBullets: (id: string, entry: WorkEntry) => void;
  handleGenerateRoleBullets: (id: string, title: string) => void;
  bulletLoading: string | null;
  experience: WorkEntry[];
  updateWork: any;
  moveWork: any;
  addWorkEntry: () => void;
  removeWorkEntry: (id: string) => void;
  updateBullet: any;
  removeBullet: any;
  addBullet: any;
}) {

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {experience.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center gap-6 bg-white/2 rounded-[3rem] border border-dashed border-white/10 group hover:border-primary/30 transition-all shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 group-hover:text-primary/40 transition-colors">
            <Briefcase size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-400">ARCHIVE_EMPTY</p>
            <p className="text-[0.65rem] text-zinc-600 font-medium uppercase tracking-[0.1em] max-w-[200px]">Operational records required for alignment.</p>
          </div>
        </div>
      )}
      
      {experience.length > 0 && (
        <div className="space-y-6">
          {experience.map((entry, idx) => (
            <ExperienceCard
              key={entry.id}
              entry={entry}
              idx={idx}
              totalEntries={experience.length}
              bulletLoading={bulletLoading}
              onRemove={removeWorkEntry}
              onUpdate={updateWork}
              onMove={moveWork}
              onUpdateBullet={updateBullet}
              onRemoveBullet={removeBullet}
              onAddBullet={addBullet}
              onRewriteBullets={handleRewriteBullets}
              onGenerateRoleBullets={handleGenerateRoleBullets}
            />
          ))}
        </div>
      )}
      
      <button 
        type="button" 
        onClick={addWorkEntry} 
        className="w-full py-6 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/2 text-[0.65rem] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group font-heading shadow-xl active:scale-[0.98]"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
        INIT_OPERATIONAL_RECORD_ENTRY
      </button>
    </div>

  );
}, (prevProps, nextProps) => {
  return prevProps.bulletLoading === nextProps.bulletLoading &&
         JSON.stringify(prevProps.experience) === JSON.stringify(nextProps.experience);
});
