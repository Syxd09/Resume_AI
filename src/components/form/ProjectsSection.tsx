import React, { memo } from 'react';
import { Plus, Globe } from 'lucide-react';
import { ProjectEntry } from '@/types/resume';
import { ProjectCard } from './cards/ProjectCard';
import { Accordion } from '@/components/ui/accordion';

interface Props {
  handleRewriteProjectDesc: (id: string, desc: string) => void;
  handleSuggestTechStack: (id: string, desc: string) => void;
  loadingSuggestion: string | null;
  projects: ProjectEntry[];
  updateProject: any;
  moveProject: any;
  addProject: () => void;
  removeProject: (id: string) => void;
}

export const ProjectsSection = memo(function ProjectsSection({
  handleRewriteProjectDesc,
  handleSuggestTechStack,
  loadingSuggestion,
  projects,
  updateProject,
  moveProject,
  addProject,
  removeProject
}: Props) {

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center gap-6 bg-white/2 rounded-[3rem] border border-dashed border-white/10 group hover:border-primary/30 transition-all shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 group-hover:text-primary/40 transition-colors">
            <Globe size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-400">SCHEMATIC_ARCHIVE_EMPTY</p>
            <p className="text-[0.65rem] text-zinc-600 font-medium uppercase tracking-[0.1em] max-w-[200px]">Technical blueprints required for tactical validation.</p>
          </div>
        </div>
      )}
      
      {projects.length > 0 && (
        <div className="space-y-6">
          {projects.map((proj, idx) => (
            <ProjectCard
              key={proj.id}
              proj={proj}
              idx={idx}
              totalEntries={projects.length}
              loadingSuggestion={loadingSuggestion}
              onRemove={removeProject}
              onUpdate={updateProject}
              onMove={moveProject}
              onRewriteDesc={handleRewriteProjectDesc}
              onSuggestTechStack={handleSuggestTechStack}
            />
          ))}
        </div>
      )}
      
      <button 
        type="button" 
        onClick={addProject} 
        className="w-full py-6 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/2 text-[0.65rem] font-black uppercase tracking-[0.4em] text-zinc-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group font-heading shadow-xl active:scale-[0.98]"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> 
        INIT_PROJECT_PROTOCOL
      </button>
    </div>

  );
}, (prevProps, nextProps) => {
  return prevProps.loadingSuggestion === nextProps.loadingSuggestion &&
         JSON.stringify(prevProps.projects) === JSON.stringify(nextProps.projects);
});
