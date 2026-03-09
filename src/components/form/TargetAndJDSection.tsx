import React, { memo } from 'react';
import { Target, ClipboardList, Sparkles } from 'lucide-react';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';

interface Props {
  targetRole: string;
  jobDescription?: string;
  updateField: any;
  SuggestionBubble: React.FC<{ field: string }>;
  loadingSuggestion?: string | null;
  fetchSuggestion?: any;
  handleAddChip?: any;
  onSkillsChange?: any;
  skillInput?: string;
  setSkillInput?: any;
  handleSuggestTargetRoles?: () => void;
  handleExtractKeywords?: () => void;
}

export const TargetAndSkillsSection = memo(function TargetAndSkillsSection({ 
  targetRole, 
  jobDescription, 
  updateField, 
  SuggestionBubble,
  loadingSuggestion,
  handleSuggestTargetRoles,
  handleExtractKeywords
}: Props) {

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      <div className="group space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <Target size={12} /> TARGET_ORBIT_DESIGNATION <span className="text-primary/50 text-[0.4rem]">*</span>
          </label>
          <button 
            type="button"
            onClick={() => handleSuggestTargetRoles?.()}
            disabled={loadingSuggestion === 'targetRoleIdeation'}
            className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-dotted text-[0.5rem] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loadingSuggestion === 'targetRoleIdeation' ? <div className="w-2 h-2 rounded-full bg-primary animate-ping" /> : <Sparkles size={10} />}
            INIT_ROLE_DEDUCTION
          </button>
        </div>
        <DebouncedInput
          type="text"
          value={targetRole}
          onChangeValue={(val) => updateField('targetRole', val)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
          placeholder="e.g. SENIOR_ORBITAL_ENGINEER"
          required
        />
        <SuggestionBubble field="targetRoleIdeation" />
        <p className="text-[0.55rem] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Deduction mapping uses this for recursive keyword injection.</p>
      </div>

      <div className="group space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <ClipboardList size={12} /> JD_TELEMETRY_STREAM <span className="text-[0.5rem] font-black px-2 py-0.5 bg-white/5 rounded-full text-zinc-600 border border-white/5 ml-2">OPTIONAL_CHANNEL</span>
          </label>
          {jobDescription && (
             <button 
                type="button"
                onClick={() => handleExtractKeywords?.()}
                disabled={loadingSuggestion === 'extractKeywords'}
                className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-dotted text-[0.5rem] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loadingSuggestion === 'extractKeywords' ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> : <Target size={10} />}
                EXTRACT_NEURAL_KEYWORDS
              </button>
          )}
        </div>
        <DebouncedTextarea
          value={jobDescription || ''}
          onChangeValue={(val) => updateField('jobDescription', val)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-sm leading-relaxed focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-800 shadow-inner min-h-[300px] custom-scrollbar resize-none"
          rows={10}
          placeholder="Inject full job description telemetry for deep-scan optimization..."
        />
        <SuggestionBubble field="extractKeywords" />
        <p className="text-[0.55rem] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Telemetry injection allows AI to calibrate Integrity Indexes against role demands.</p>
      </div>
    </div>

  );
}, (prevProps, nextProps) => {
  return prevProps.targetRole === nextProps.targetRole &&
         prevProps.jobDescription === nextProps.jobDescription &&
         prevProps.loadingSuggestion === nextProps.loadingSuggestion;
});
