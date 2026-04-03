'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Send, Upload, Sparkles, ChevronRight, ChevronLeft, Check, Loader2, RefreshCcw,
  User, Target, Code, Briefcase, Globe, GraduationCap, X, Plus, Award, Languages, FileText,
  BarChart3, AlertTriangle, CheckCircle2, Shield, Zap, ChevronDown, ChevronUp, Lightbulb, Info, Save
} from 'lucide-react';
import { ResumeData, ResumeTemplate, WorkEntry } from '@/types/resume';
import { useResumeStore } from '@/store/useResumeStore';
import { DebouncedInput, DebouncedTextarea } from '@/components/DebouncedInput';
import { PersonalSection } from '@/components/form/PersonalSection';
import { TargetAndSkillsSection } from '@/components/form/TargetAndJDSection';
import { ExperienceSection } from '@/components/form/ExperienceSection';
import { ProjectsSection } from '@/components/form/ProjectsSection';
import { EducationSection } from '@/components/form/EducationSection';
import { resumeSchema } from '@/lib/validations/resume';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface ResumeFormProps {
  onSubmit: (data: ResumeData) => void;
  isLoading: boolean;
}

const STEPS = [
  { id: 0, title: 'BASELINE',        icon: Upload,         desc: 'Initialize neural data' },
  { id: 1, title: 'IDENTITY',        icon: User,           desc: 'Contact & visualization' },
  { id: 2, title: 'TARGETING',       icon: Target,         desc: 'Role & keyword mapping' },
  { id: 3, title: 'HISTORY',         icon: Briefcase,      desc: 'Experience chronicles' },
  { id: 4, title: 'ELEVATION',       icon: GraduationCap,  desc: 'Projects & academic audit' },
  { id: 5, title: 'VALIDATION',      icon: Send,           desc: 'Finalize & generate build' },
];

const STEP_AI_TIPS: Record<number, { icon: React.ElementType; tip: string; action?: string }> = {
  1: { icon: Sparkles, tip: 'Cognitive engine detects profile metadata. Integrating LinkedIn/GitHub increases integrity by 12%.', action: 'Neural Sync' },
  2: { icon: Lightbulb, tip: 'Map target protocols to extract 100% of required keywords for orbital bypass.', action: 'Scan Active' },
  3: { icon: Zap, tip: 'Engage "Cognitive Rewrite" to transform standard entries into metric-driven impact trajectories.', action: 'Precision' },
  4: { icon: Sparkles, tip: 'Auto-suggestion for tech stacks and coursework is online. Toggle the sparkle icons.', action: 'Auto-Link' },
  5: { icon: Shield, tip: 'Run the Deep Scan audit to finalize system readiness and auto-fix weak neural links.', action: 'Audit Hub' },
};

const TEMPLATES: { id: ResumeTemplate; name: string; desc: string }[] = [
  { id: 'professional', name: 'Professional', desc: 'Clean, traditional corporate layout' },
  { id: 'modern',       name: 'Modern',       desc: 'Contemporary with accent sections' },
  { id: 'minimal',      name: 'Minimal',      desc: 'Simple, highly ATS-parseable' },
  { id: 'executive',    name: 'Executive',    desc: 'Bold branding for leadership roles' },
  { id: 'creative',     name: 'Creative',     desc: 'Unique structure for design fields' },
  { id: 'tech',         name: 'Tech',         desc: 'Optimized for developer skill grids' },
  { id: 'startup',      name: 'Startup',      desc: 'Dynamic, high-impact aesthetic' },
  { id: 'academic',     name: 'Academic',     desc: 'CV style for research and education' },
  { id: 'classic',      name: 'Classic',      desc: 'Tried-and-true serif typography' },
  { id: 'bold',         name: 'Bold',         desc: 'Striking headers with stark contrast' },
  { id: 'elegant',      name: 'Elegant',      desc: 'Sophisticated spacing and geometry' },
  { id: 'compact',      name: 'Compact',      desc: 'Dense data layout for 1-page limits' },
  { id: 'datascientist',name: 'Data Science', desc: 'Emphasis on tools & certifications' },
  { id: 'designer',     name: 'Designer',     desc: 'Showcase portfolios & visuals' },
  { id: 'finance',      name: 'Finance',      desc: 'Strictly formatted for banking roles' },
];

// Auto-trigger: extract skills from JD when user arrives at step 2 with no skills
function AutoTriggerSkillExtract({ jd, fetchSuggestion }: { jd: string; fetchSuggestion: (field: string, value: string) => void }) {
  const triggered = useRef(false);
  React.useEffect(() => {
    if (!triggered.current && jd.length > 30) {
      triggered.current = true;
      setTimeout(() => fetchSuggestion('skills', `Extract the most important technical skills and keywords from this JD: ${jd.substring(0, 500)}`), 600);
    }
  }, [jd, fetchSuggestion]);
  return null;
}

// Auto-trigger: readiness review when user arrives at Review step
function AutoTriggerReview({ handleReviewReadiness }: { handleReviewReadiness: () => void }) {
  const triggered = useRef(false);
  React.useEffect(() => {
    if (!triggered.current) {
      triggered.current = true;
      setTimeout(() => handleReviewReadiness(), 800);
    }
  }, [handleReviewReadiness]);
  return null;
}

// --- AI Expert Advisor Logic ---
const AI_ADVISOR_DATA: Record<number, string[]> = {
  1: ["Deploy high-quality visualization for creative configurations to maximize engagement.", "Synchronize LinkedIn/GitHub or other neural professional nodes.", "Log: Use professional communication protocols: first.last@domain.com."],
  2: ["Gravity filters prioritize mandatory skills. Ensure all required protocols are mapped.", "Use standardized job titles for 100% audit accuracy from the orbital scan.", "Active JD mapping extracts 100% of hidden keywords for your specific sector."],
  3: ["Action protocols like 'Spearheaded' outperform passive states.", "Metrics are the currency of the Observatory. Map growth and efficiency gains precisely.", "Maintain bullet density below 2 lines for optical scan optimization."],
  4: ["Highlight core initiatives that demonstrate direct mission impact.", "Sync relevant coursework if the build is for a new orbital trajectory.", "Map tech stacks for every project to double keyword hits in the deep scan."],
  5: ["An 80+ integrity score guarantees human visualization of your manifesto.", "Deploy 'Modern' for tech-sectors and 'Professional' for corporate stations.", "Ensure a tailored manifesto (cover letter) is generated for each elevation."],
  0: ["Upload legacy manifestos to save 600s of manual data mapping.", "Starting fresh? Use 'Magic Baseline' for a neural headstart tailored to your role.", "High-fidelity data inputs lead to superior cognitive optimization."]
};

// --- Live ATS Score Logic (Simplified but deterministic) ---
const calculateLiveScore = (data: ResumeData) => {
  let score = 20; // Baseline
  if (data.personal.fullName) score += 5;
  if (data.personal.email && data.personal.phone) score += 5;
  if (data.personal.linkedin || data.personal.github) score += 5;
  if (data.targetRole) score += 10;
  if (data.skills.length > 5) score += 10;
  if (data.skills.length > 10) score += 5;
  if (data.experience.length > 0) score += 10;
  if (data.experience.some(e => e.bullets.length >= 3)) score += 10;
  if (data.projects.length > 0) score += 10;
  if (data.education.length > 0) score += 10;
  return Math.min(score, 100);
};

export default function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const store = useResumeStore();
  const data = store.data;
  const step = (typeof store.step === 'number' && store.step >= 0 && store.step < STEPS.length) ? store.step : 0;
  const setStep = store.setStep;

  // AI suggestions
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Cover letter state
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);
  const [bulletLoading, setBulletLoading] = useState<string | null>(null);

  // Custom modal state
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Resume readiness review
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [fixingType, setFixingType] = useState<string | null>(null);
  const [showBulletDetails, setShowBulletDetails] = useState(false);
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  // Upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // --- AI Suggestions ---
  const fetchSuggestion = async (field: string, value: string) => {
    setLoadingSuggestion(field);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value, target_role: data.targetRole }),
      });
      const result = await res.json();
      if (result.suggestion) setSuggestions(p => ({ ...p, [field]: result.suggestion }));
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };

  // Skill input local states
  const [skillInput, setSkillInput] = useState('');
  const [certInput, setCertInput] = useState('');
  const [langInput, setLangInput] = useState('');

  // Image upload
  const profileImageRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const handleAddChip = (field: 'skills' | 'certifications' | 'languages', input: string, setInput: (v: string) => void) => {
    store.addChip(field, input);
    setInput('');
  };

  // --- AI Expert Advisor ---
  const [advisorTipIdx, setAdvisorTipIdx] = useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAdvisorTipIdx(prev => (prev + 1) % (AI_ADVISOR_DATA[step]?.length || 1));
    }, 8000);
    return () => clearInterval(interval);
  }, [step]);

  const liveScore = calculateLiveScore(data);
  const scoreColor = `hsl(${liveScore * 1.2}, 70%, 45%)`;

  const handleMagicBaseline = async () => {
    if (!data.targetRole) {
      toast.error("Please enter a Target Role first!");
      return;
    }
    setLoadingSuggestion('magicBaseline');
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'roleBullets', value: data.targetRole }),
      });
      const result = await res.json();
      if (result.suggestion) {
        const bullets = result.suggestion.split('\n').map((b: string) => b.replace(/^[•\-\*\s]+/, '').trim()).filter(Boolean);
        const newEntry = {
          id: crypto.randomUUID(),
          company: 'AI Generated Company',
          jobTitle: data.targetRole,
          location: 'Remote',
          startDate: '2022-01',
          endDate: 'Present',
          current: true,
          description: '',
          bullets: bullets.length > 0 ? bullets : ['Led key initiatives to drive 15% efficiency gains.']
        };
        store.setResumeData({ experience: [...data.experience, newEntry] });
        toast.success("Magic Baseline generated! Just edit the details.");
      }
    } catch { toast.error("Failed to generate magic baseline."); }
    setLoadingSuggestion(null);
  };

  // --- Auto-Save ---
  const lastSavedDataRef = useRef<string>('');
  
  React.useEffect(() => {
    if (!store.currentResumeId) return; // Don't auto-save before initial generation
    const timer = setTimeout(() => {
      const currentDataStr = JSON.stringify(data);
      if (currentDataStr === lastSavedDataRef.current) return; // Data hasn't uniquely changed

      lastSavedDataRef.current = currentDataStr;
      
      // Background save without blocking UI state
      fetch('/api/resumes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: store.currentResumeId, 
          data: data 
        }),
      }).catch(err => console.error('Silent auto-save failed:', err));
    }, 3500);
    return () => clearTimeout(timer);
  }, [data, store.currentResumeId]);

  const applySuggestion = (field: string) => {
    const s = suggestions[field];
    if (!s) return;
    if (field === 'skills') {
      const newSkills = s.split(',').map(sk => sk.trim()).filter(Boolean);
      newSkills.forEach(sk => store.addChip('skills', sk));
    } else if (field === 'summary') {
      store.updateField('summary', s);
    } else if (field === 'targetRoleIdeation') {
      applyTargetRoleSuggestion(); // default: applies first
      return;
    } else if (field === 'extractKeywords') {
      const newSkills = s.split(',').map(sk => sk.trim()).filter(Boolean);
      newSkills.forEach(sk => store.addChip('skills', sk));
    }
    dismissSuggestion(field);
  };

  const dismissSuggestion = (field: string) => {
    setSuggestions(p => { const c = { ...p }; delete c[field]; return c; });
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: 'summary',
          value: JSON.stringify({
            name: data.personal.fullName,
            role: data.targetRole,
            skills: data.skills.join(', '),
            experience: data.experience.map(e => `${e.jobTitle} at ${e.company}`).join('; '),
            education: data.education.map(e => `${e.degree} from ${e.institution}`).join('; '),
          }),
          target_role: data.targetRole,
          job_description: data.jobDescription,
          skills: data.skills.join(', '),
        }),
      });
      const result = await res.json();
      if (result.suggestion) store.updateField('summary', result.suggestion);
    } catch { /* silent */ }
    setSummaryLoading(false);
  };

  // Debounced skill suggestion
  const onSkillsChange = () => {
    const val = data.skills.join(', ');
    if (val.length > 10) {
      if (debounceTimers.current['skills']) clearTimeout(debounceTimers.current['skills']);
      debounceTimers.current['skills'] = setTimeout(() => { fetchSuggestion('skills', val); }, 2000);
    }
  };

  const handleRewriteBullets = async (entryId: string, entry: WorkEntry) => {
    if (!entry.bullets || entry.bullets.length === 0 || entry.bullets.every(b => b.trim() === '')) return;
    setBulletLoading(entryId);
    try {
      const res = await fetch('/api/rewrite-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry, targetRole: data.targetRole, jobDescription: data.jobDescription }),
      });
      const result = await res.json();
      if (result.bullets) {
        // Clear existing bullets and add rewritten ones
        for (let i = entry.bullets.length - 1; i >= 0; i--) {
          store.removeBullet(entryId, i);
        }
        result.bullets.forEach((b: string, i: number) => {
          if (i === 0) {
             store.addBullet(entryId);
             store.updateBullet(entryId, 0, b);
          } else {
             store.addBullet(entryId);
             store.updateBullet(entryId, i, b);
          }
        });
        // cleanup if addBullet adds empty ones
        const updated = store.data.experience.find(e => e.id === entryId);
        if (updated) {
          updated.bullets.forEach((b, i) => {
            if (b.trim() === '' && i < result.bullets.length) {
              store.updateBullet(entryId, i, result.bullets[i]);
            }
          });
        }
      } else if (result.error) {
         toast.error(result.error);
      }
    } catch { 
       toast.error('Failed to rewrite bullets.');
    } finally {
      setBulletLoading(null);
    }
  };

  const handleGenerateRoleBullets = async (entryId: string, jobTitle: string) => {
    if (!jobTitle) return;
    setBulletLoading(entryId + '_generate');
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'roleBullets', value: jobTitle, target_role: data.targetRole, job_description: data.jobDescription }),
      });
      const result = await res.json();
      if (result.suggestion) {
         const newBullets = result.suggestion.split('\n').map((b: string) => b.replace(/^[-*•▸]\s*/, '').trim()).filter(Boolean);
         
         // Only replace empty bullets or add new ones
         const entry = data.experience.find(e => e.id === entryId);
         if (entry) {
             let currentBulletIndex = 0;
             newBullets.forEach((bulletText: string) => {
                 // Try to fill in empty existing bullets first
                 while (currentBulletIndex < entry.bullets.length && entry.bullets[currentBulletIndex].trim() !== '') {
                     currentBulletIndex++;
                 }
                 if (currentBulletIndex < entry.bullets.length) {
                     store.updateBullet(entryId, currentBulletIndex, bulletText);
                     currentBulletIndex++;
                 } else {
                     // create new bullet
                     store.addBullet(entryId);
                     setTimeout(() => {
                        // slight hack because state needs to propagate before update
                         try { store.updateBullet(entryId, entry.bullets.length, bulletText); } catch {}
                     }, 50);
                 }
             });
         }
      }
    } catch { 
       toast.error('Failed to generate bullet ideas.');
    } finally {
      setBulletLoading(null);
    }
  };

  const handleRewriteProjectDesc = async (projId: string, desc: string) => {
    if (!desc) return;
    setLoadingSuggestion(projId);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'projectDesc', value: desc, target_role: data.targetRole, job_description: data.jobDescription }),
      });
      const result = await res.json();
      if (result.suggestion) {
         store.updateProject(projId, 'description', result.suggestion);
      }
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };

  const handleSuggestTechStack = async (projId: string, desc: string) => {
    if (!desc) return;
    setLoadingSuggestion(projId + '_tech');
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'techStackFromDesc', value: desc }),
      });
      const result = await res.json();
      if (result.suggestion) {
         store.updateProject(projId, 'techStack', result.suggestion);
      }
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };

  const handleSuggestCoursework = async (eduId: string, degree: string) => {
    if (!degree) return;
    setLoadingSuggestion(eduId + '_coursework');
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'courseworkFromDegree', value: degree, target_role: data.targetRole, skills: data.skills.join(', ') }),
      });
      const result = await res.json();
      if (result.suggestion) {
         store.updateEducation(eduId, 'coursework', result.suggestion);
      }
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };

  const handleSuggestTargetRoles = async () => {
    setLoadingSuggestion('targetRoleIdeation');
    try {
      const expSum = data.experience.map(e => e.jobTitle).join(', ') + ' ' + data.skills.join(', ');
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'targetRoleIdeation', value: expSum || 'Entry Level', job_description: data.jobDescription || '' }),
      });
      const result = await res.json();
      if (result.suggestion) {
        setSuggestions(p => ({ ...p, targetRoleIdeation: result.suggestion }));
      }
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };

  const handleExtractKeywords = async () => {
    if (!data.jobDescription) return;
    setLoadingSuggestion('extractKeywords');
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'extractKeywords', value: data.jobDescription }),
      });
      const result = await res.json();
      if (result.suggestion) {
        setSuggestions(p => ({ ...p, extractKeywords: result.suggestion }));
      }
    } catch { /* silent */ }
    setLoadingSuggestion(null);
  };
  
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const res = await fetch('/api/resumes', {
        method: store.currentResumeId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: store.currentResumeId, 
          title: `${data.targetRole || 'Untitled'} Resume`, 
          data: data,
          markdown: '# Generated' // Placeholder since we now use structured JSON
        }),
      });
      const result = await res.json();
      if (result.resume?.id) {
        store.setCurrentResumeId(result.resume.id);
        toast.success('Resume draft saved successfully!');
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const applyTargetRoleSuggestion = (specificRole?: string) => {
    const s = suggestions['targetRoleIdeation'];
    if (!s) return;
    if (specificRole) {
      // Apply specific clicked role
      store.updateField('targetRole', specificRole.trim());
    } else {
      // Fallback: apply the first suggested title
      const firstRole = s.split(',')[0].trim();
      store.updateField('targetRole', firstRole);
    }
    dismissSuggestion('targetRoleIdeation');
  };

  const handleGenerateCoverLetter = async () => {
    setCoverLetterLoading(true);
    setCoverLetter(null);
    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data, jobDescription: data.jobDescription }),
      });
      const result = await res.json();
      if (result.coverLetter) {
        setCoverLetter(result.coverLetter);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to generate cover letter.');
    } finally {
      setCoverLetterLoading(false);
    }
  };

  // --- Upload ---
  const processFile = async (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.txt', '.md', '.pdf', '.docx'].includes(ext)) {
      setUploadMsg('Unsupported format. Use PDF, DOCX, TXT, or MD.');
      return;
    }
    setIsUploading(true);
    setUploadMsg(null);
    setUploadedFile(file.name);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: fd });
      const result = await res.json();
      if (result.parsed) {
        const p = result.parsed;
        store.setResumeData({
          personal: {
            fullName: p.fullName || p.name || data.personal.fullName,
            email: p.email || data.personal.email,
            phone: p.phone || data.personal.phone,
            location: p.location || data.personal.location,
            linkedin: p.linkedin || data.personal.linkedin,
            github: p.github || data.personal.github,
            portfolio: p.portfolio || data.personal.portfolio,
          },
          summary: p.summary || data.summary,
          targetRole: p.targetRole || p.target_role || data.targetRole,
          skills: p.skills ? (Array.isArray(p.skills) ? p.skills : p.skills.split(',').map((s: string) => s.trim()).filter(Boolean)) : data.skills,
          experience: p.experience && Array.isArray(p.experience) && p.experience.length > 0
            ? p.experience.map((e: any) => ({
                id: crypto.randomUUID(),
                jobTitle: e.jobTitle || e.title || '',
                company: e.company || '',
                location: e.location || '',
                startDate: e.startDate || '',
                endDate: e.endDate || '',
                bullets: Array.isArray(e.bullets) ? e.bullets : (e.description ? [e.description] : ['']),
              }))
            : data.experience,
          projects: p.projects && Array.isArray(p.projects)
            ? p.projects.map((pr: any) => ({
                id: crypto.randomUUID(),
                name: pr.name || '',
                techStack: pr.techStack || pr.tech || '',
                description: pr.description || '',
                link: pr.link || '',
              }))
            : data.projects,
          education: p.education && Array.isArray(p.education) && p.education.length > 0
            ? p.education.map((ed: any) => ({
                id: crypto.randomUUID(),
                degree: ed.degree || '',
                institution: ed.institution || '',
                year: ed.year || '',
                gpa: ed.gpa || '',
              }))
            : data.education,
          certifications: p.certifications && Array.isArray(p.certifications) ? p.certifications : data.certifications,
          languages: p.languages && Array.isArray(p.languages) ? p.languages : data.languages,
        });
        setUploadMsg('✅ Resume parsed! Review each section below.');
        setStep(1);
      } else {
        setUploadMsg(result.error || 'Could not parse.');
        setUploadedFile(null);
      }
    } catch {
      setUploadMsg('Upload failed.');
      setUploadedFile(null);
    }
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      store.updatePersonal('profileImage', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationErrors({});

    // Filter out completely empty boilerplate instances
    const cleanedData = {
      ...data,
      experience: data.experience.filter(exp => 
        exp.company.trim() || exp.jobTitle.trim() || exp.bullets.some(b => b.trim())
      ),
      education: data.education.filter(edu => 
        edu.institution.trim() || edu.degree.trim() || edu.year.trim()
      ),
      projects: data.projects.filter(proj => 
        proj.name.trim() || proj.techStack.trim() || proj.description.trim()
      ),
    };

    const result = resumeSchema.safeParse(cleanedData);
    
    if (!result.success) {
      // Instead of immediately blocking, try "Magic Repair" for minor issues
      toast.loading('Polishing your data with AI...', { id: 'magic-repair' });
      setFixingType('magicRepair');
      
      try {
        const res = await fetch('/api/resume-fix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fixType: 'magicRepair', data: cleanedData }),
        });
        
        if (res.ok) {
          const { fixedData } = await res.json();
          // Update store with fixed data
          store.setResumeData(fixedData);
          
          // Re-validate fixed data
          const finalResult = resumeSchema.safeParse(fixedData);
          if (finalResult.success) {
            toast.success('Validation fixed by AI!', { id: 'magic-repair' });
            setFixingType(null);
            onSubmit(fixedData);
            return;
          }
        }
      } catch (err) {
        console.error('Magic repair failed:', err);
      }
      
      toast.dismiss('magic-repair');
      setFixingType(null);

      // If AI couldn't fix it or failed, show the issues
      const newErrors: Record<string, string[]> = {};
      result.error.issues.forEach((err) => {
        const path = err.path;
        let section = 'General';
        let prefix = '';
        
        if (path[0] === 'personal') section = 'Personal Details';
        else if (path[0] === 'experience') {
          section = 'Work Experience';
          if (typeof path[1] === 'number') prefix = `(Entry #${path[1] + 1}) `;
        }
        else if (path[0] === 'education') {
          section = 'Education';
          if (typeof path[1] === 'number') prefix = `(Entry #${path[1] + 1}) `;
        }
        else if (path[0] === 'projects') {
          section = 'Projects';
          if (typeof path[1] === 'number') prefix = `(Entry #${path[1] + 1}) `;
        }
        else if (path[0] === 'targetRole' || path[0] === 'jobDescription') section = 'Target & JD';
        else if (path[0] === 'skills') section = 'Skills';
        
        if (!newErrors[section]) newErrors[section] = [];
        const fieldName = String(path[path.length - 1]).replace(/([A-Z])/g, ' $1').toLowerCase();
        newErrors[section].push(`${prefix}${fieldName}: ${err.message}`);
      });

      if (Object.keys(newErrors).length > 0) {
        setValidationErrors(newErrors);
        toast.error('Form has issues AI couldn\'t fix. Please review at the bottom.');
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
        return;
      }
    }

    onSubmit(cleanedData);
  };

  const handleReviewReadiness = async () => {
    setReviewLoading(true);
    setReviewResult(null);
    try {
      const res = await fetch('/api/resume-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        setReviewResult(result);
      }
    } catch { /* silent */ }
    setReviewLoading(false);
  };

  const handleAutoFix = async (fixType: string) => {
    setFixingType(fixType);
    try {
      const res = await fetch('/api/resume-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixType, data }),
      });
      const result = await res.json();
      if (!res.ok) { setFixingType(null); return; }

      if (fixType === 'bullets' && result.fixedExperience) {
        const fixedList = result.fixedExperience;
        for (let i = 0; i < fixedList.length; i++) {
          const fixed = fixedList[i];
          if (!Array.isArray(fixed.bullets) || fixed.bullets.length === 0) continue;
          // Try by ID first, fall back to index matching
          const byId = data.experience.find((e: any) => e.id === fixed.id);
          const target = byId || data.experience[i];
          if (target) {
            store.updateWork(target.id, 'bullets', fixed.bullets);
          }
        }
      }
      if (fixType === 'summary' && result.summary) {
        store.updateField('summary', result.summary);
      }
      if (fixType === 'projects' && result.fixedProjects) {
        const fixedList = result.fixedProjects;
        for (let i = 0; i < fixedList.length; i++) {
          const fixed = fixedList[i];
          if (!fixed.description) continue;
          const byId = data.projects.find((p: any) => p.id === fixed.id);
          const target = byId || data.projects[i];
          if (target) {
            store.updateProject(target.id, 'description', fixed.description);
          }
        }
      }

      // Re-run readiness check after fix (delay for store updates)
      setTimeout(() => handleReviewReadiness(), 800);
    } catch { /* silent */ }
    setFixingType(null);
  };

  const handleApplyAllFixes = async () => {
    setFixingType('all');
    const fixTypes: string[] = [];
    if (reviewResult?.sectionChecks) {
      for (const s of reviewResult.sectionChecks) {
        if (s.fixable && s.fixType && !fixTypes.includes(s.fixType)) {
          fixTypes.push(s.fixType);
        }
      }
    }
    if (reviewResult?.bulletIssues?.length > 0 && !fixTypes.includes('bullets')) {
      fixTypes.push('bullets');
    }
    for (const ft of fixTypes) {
      setFixingType(ft);
      await handleAutoFix(ft);
    }
    setFixingType(null);
  };

  const nextStep = () => { setStep(Math.min(step + 1, STEPS.length - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const prevStep = () => { setStep(Math.max(step - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  // Keyboard shortcuts: Ctrl+ArrowRight / Ctrl+ArrowLeft
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); nextStep(); }
      if (e.ctrlKey && e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const canProceed = useCallback((s: number): boolean => {
    switch (s) {
      case 1: return data.personal.fullName.trim().length > 0 && (data.personal.email.trim().length > 0 || data.personal.phone.trim().length > 0);
      case 2: return data.targetRole.trim().length > 0;
      default: return true;
    }
  }, [data]);

  // Real per-step completion detection
  const isStepComplete = useCallback((s: number): boolean => {
    switch (s) {
      case 0: return true; // Start is always complete once passed
      case 1: return data.personal.fullName.trim().length > 0 && (data.personal.email.trim().length > 0 || data.personal.phone.trim().length > 0);
      case 2: return data.targetRole.trim().length > 0 && data.skills.length > 0;
      case 3: return data.experience.some(e => e.jobTitle.trim().length > 0 && e.company.trim().length > 0);
      case 4: return data.education.some(e => e.degree.trim().length > 0);
      case 5: return false; // Review is never "complete" — it's the final step
      default: return false;
    }
  }, [data]);

  const filledCount = [
    data.personal.fullName, data.personal.email || data.personal.phone,
    data.targetRole, data.skills.length > 0 ? 'y' : '',
    data.experience.some(e => e.jobTitle) ? 'y' : '',
    data.education.some(e => e.degree) ? 'y' : '',
  ].filter(Boolean).length;
  const progress = Math.round((filledCount / 6) * 100);
  const isLastStep = step === STEPS.length - 1;

  // --- Suggestion Bubble ---
  const SuggestionBubble = ({ field }: { field: string }) => {
    if (loadingSuggestion === field) {
      return (
        <div className="mt-4 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-3 animate-pulse">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary/80 font-heading">Neural Processing...</span>
        </div>
      );
    }
    if (!suggestions[field]) return null;

    if (field === 'targetRoleIdeation') {
      const roles = suggestions[field].split(',').map(r => r.trim()).filter(Boolean);
      return (
        <div className="mt-6 p-6 rounded-[2rem] border border-primary/20 orbital-glass bg-primary/5 shadow-2xl animate-fade-in relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles size={18} className="animate-pulse" />
              <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] font-heading">Neural Trajectories Identified</span>
            </div>
            <button onClick={() => dismissSuggestion(field)} className="text-zinc-500 hover:text-white transition-colors" type="button"><X size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {roles.map((role, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyTargetRoleSuggestion(role)}
                className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[0.65rem] font-black uppercase tracking-widest text-zinc-300 hover:bg-primary/20 hover:border-primary/40 hover:text-white transition-all transform hover:scale-105 active:scale-95 group font-heading"
              >
                <Target size={12} className="group-hover:rotate-45 transition-transform" />
                {role}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-6 p-6 rounded-[2rem] border border-primary/20 orbital-glass bg-primary/5 shadow-2xl animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-primary">
            <Sparkles size={18} className="animate-pulse" />
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] font-heading">
              {field === 'extractKeywords' ? 'EXTRACTED TELEMETRY' : 'COGNITIVE SUGGESTION'}
            </span>
          </div>
          <button onClick={() => dismissSuggestion(field)} className="text-zinc-500 hover:text-white transition-colors" type="button"><X size={16} /></button>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-medium">{suggestions[field]}</p>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => applySuggestion(field)} 
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-[0.6rem] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] font-heading" 
            type="button"
          >
            <Check size={14} strokeWidth={3} /> {field === 'extractKeywords' ? 'SYNCHRONIZE' : 'DEPLOY'}
          </button>
          {field === 'extractKeywords' && (
            <p className="text-[0.55rem] text-zinc-500 uppercase font-black tracking-widest italic leading-none">Mapping keywords to neural stack...</p>
          )}
        </div>
      </div>
    );
  };

  // We only show the UI after hydration is complete to avoid SSR mismatch with localStorage
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="p-8 md:p-12 text-white animate-fade-in relative z-10 font-body">
      {step > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
               <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-primary/80 font-heading">Neural Construction Progress</span>
            </div>
            <span className="text-xs font-black tracking-widest text-primary font-heading italic">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div 
              className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 transition-all duration-1000 ease-out rounded-full relative" 
              style={{ width: `${progress}%` }}
            >
              <div className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-md animate-[glit-slide_2s_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* === Cinematic Tech Stepper === */}
      <div className="flex items-start mb-16 overflow-x-auto pb-4 hide-scrollbar gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === i;
          const isComplete = i < step && isStepComplete(i);
          const isPast = i < step;
          return (
            <React.Fragment key={s.id}>
              <button
                className={`flex flex-col items-center gap-3 min-w-[100px] group transition-all duration-500 perspective-1000`}
                onClick={() => { setStep(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                type="button"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 relative overflow-hidden ${
                  isActive ? 'bg-primary text-white border-primary shadow-[0_0_30px_rgba(59,130,246,0.5)] rotate-y-12 scale-110'
                  : isComplete ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : isPast ? 'bg-white/5 text-zinc-400 border-white/10'
                  : 'bg-white/2 text-zinc-600 border-white/5 hover:border-white/20'
                }`}>
                  {isActive && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />}
                  {isComplete ? <Check size={20} strokeWidth={3} /> : <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />}
                  
                  {/* Status Indicator Dot */}
                  <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-white animate-pulse' : isComplete ? 'bg-emerald-500' : isPast ? 'bg-zinc-500' : 'bg-transparent'
                  }`} />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-500 font-heading ${isActive ? 'text-primary' : isPast ? 'text-zinc-400' : 'text-zinc-600'}`}>{s.title}</span>
                  <div className={`h-[2px] rounded-full transition-all duration-500 ${isActive ? 'w-full bg-primary' : 'w-0 bg-transparent'}`} />
                </div>
              </button>
              
              {i < STEPS.length - 1 && (
                <div className="flex-1 flex items-center min-w-[20px] pt-7">
                  <div className={`h-[1px] w-full transition-all duration-700 ${i < step ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mb-12 relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               {React.createElement(STEPS[step].icon, { size: 24, className: "text-primary animate-pulse" })}
               <h2 className="text-3xl font-black tracking-tight font-heading flex items-center gap-4 italic uppercase">
                 {STEPS[step].title}
               </h2>
            </div>
            <p className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-[0.2em]">{STEPS[step].desc}</p>
          </div>
          
          {/* Master Integrity Telemetry */}
          <div className="relative group">
            <button 
              type="button"
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-[2rem] px-8 py-4 backdrop-blur-xl transition-all hover:bg-white/10 hover:border-white/20 group active:scale-95 outline-none font-heading" 
            >
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                  <circle 
                    cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray={175.9} 
                    strokeDashoffset={175.9 - (175.9 * (reviewResult?.projectedScore || liveScore)) / 100} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                    style={{ color: reviewResult ? `hsl(${reviewResult.projectedScore * 1.2}, 70%, 45%)` : scoreColor }} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-black italic tracking-tighter" style={{ color: reviewResult ? `hsl(${reviewResult.projectedScore * 1.2}, 70%, 45%)` : scoreColor }}>
                    {reviewResult?.projectedScore || liveScore}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-start gap-1">
                <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-primary transition-colors">INTEGRITY_INDEX</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black uppercase tracking-widest">{reviewResult ? 'VERIFIED' : 'ESTIMATE'}</span>
                  <ChevronDown size={14} className={`text-primary transition-transform duration-500 ${showScoreDetails ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>

            {/* Score Details Technical Overlay */}
            {showScoreDetails && (
              <div className="absolute right-0 top-full mt-4 w-72 sm:w-96 orbital-glass border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-[2.5rem] z-50 p-8 animate-in fade-in zoom-in-95 duration-300 origin-top-right backdrop-blur-3xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-primary animate-pulse" />
                    <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] font-heading">Neural Audit Logistics</h3>
                  </div>
                  <button onClick={() => setShowScoreDetails(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                {!reviewResult ? (
                  <div className="text-center py-6 space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary relative">
                       <Zap size={28} className="animate-pulse" />
                       <div className="absolute inset-0 border border-primary/30 rounded-full animate-ping" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[0.65rem] font-black uppercase tracking-widest text-primary font-heading">Audit Protocol: Offline</p>
                      <p className="text-xs text-zinc-400 font-medium px-4">Initialization required for deep-sector neural analysis.</p>
                    </div>
                    <button 
                      onClick={handleReviewReadiness} 
                      disabled={reviewLoading}
                      className="w-full py-4 bg-primary text-white rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 font-heading"
                    >
                      {reviewLoading ? <Loader2 size={16} className="animate-spin text-white" /> : <Sparkles size={16} />}
                      EXECUTE_SCAN
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'KEY_MAP', val: reviewResult.keywordScore },
                        { label: 'VISUAL', val: reviewResult.formatScore },
                        { label: 'DENSITY', val: reviewResult.bulletScore }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center group hover:border-primary/30 transition-all">
                          <p className="text-[0.45rem] font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-primary">{stat.label}</p>
                          <p className="text-lg font-black font-heading tracking-tighter italic">{stat.val}%</p>
                        </div>
                      ))}
                    </div>

                    {reviewResult.sectionChecks && (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        <p className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">CRITICAL_ANOMALIES</p>
                        {reviewResult.sectionChecks.filter((s:any) => s.status !== 'pass').slice(0, 5).map((s:any, i:number) => (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all border-l-4 border-l-red-500/50">
                            <div className="flex-1 space-y-1">
                              <p className="text-[0.65rem] font-black uppercase tracking-widest text-white">{s.name}</p>
                              <p className="text-[0.65rem] text-zinc-400 font-medium leading-relaxed">{s.detail}</p>
                            </div>
                            {s.fixable && (
                              <button onClick={() => { handleAutoFix(s.fixType); setShowScoreDetails(false); }} className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg text-[0.55rem] font-black uppercase tracking-widest self-center transition-all hover:bg-primary hover:text-white">AUTO_FIX</button>
                            )}
                          </div>
                        ))}
                        {reviewResult.sectionChecks.every((s:any) => s.status === 'pass') && (
                          <div className="flex flex-col items-center gap-3 py-6 text-emerald-400">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 size={24} />
                            </div>
                            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">All Systems Nominal</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button 
                      onClick={handleReviewReadiness} 
                      disabled={reviewLoading}
                      className="w-full py-4 border border-white/10 rounded-2xl text-[0.6rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
                    >
                      <RefreshCcw size={14} className={reviewLoading ? 'animate-spin' : ''} /> RE_INITIALIZE_SCAN
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cinematic AI Expert Advisor Banner */}
        {AI_ADVISOR_DATA[step] && (
          <div className="mt-8 flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] border border-primary/20 orbital-glass bg-primary/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-primary/50 via-primary to-primary/50" />
            
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 relative">
               <Sparkles size={20} className="animate-pulse" />
               <div className="absolute -inset-1 border border-primary/20 rounded-2xl animate-ping opacity-20" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-primary font-heading">Cognitive Advisor Active</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed italic transition-all duration-500">
                &quot;{AI_ADVISOR_DATA[step][advisorTipIdx]}&quot;
              </p>
            </div>
            
            <div className="flex gap-2 shrink-0 md:flex-col md:gap-1.5 px-4 md:border-l md:border-white/5">
              {AI_ADVISOR_DATA[step].map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === advisorTipIdx ? 'bg-primary w-6 md:h-6 md:w-1' : 'bg-white/10 w-2 md:h-2 md:w-1'}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>

        {/* === STEP 0: NEURAL INITIALIZER (UPLOAD) === */}
        {step === 0 && (
          <div className="animate-fade-in space-y-10">
            <div className="relative group overflow-hidden rounded-[3rem] border border-white/5 bg-white/2 p-12 text-center transition-all hover:bg-white/5 hover:border-primary/30 flex flex-col items-center gap-6" onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
              onDragLeave={e => e.currentTarget.classList.remove('drag-over')}
              onDrop={handleDrop}>
              
              {/* Cinematic Upload Core */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border border-primary/20 rounded-full animate-[slow-rotate_10s_linear_infinite]" />
                <div className="absolute inset-4 border border-primary/40 rounded-full animate-[slow-rotate_6s_linear_infinite_reverse]" />
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                
                {isUploading ? (
                  <Loader2 size={48} className="animate-spin text-primary relative z-10" />
                ) : (
                  <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                    <Upload size={40} className="text-primary" strokeWidth={1.5} />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black uppercase tracking-[0.3em] font-heading flex flex-col items-center gap-2 italic">
                  {isUploading ? 'SYNCHRONIZING_DATA...' : 'INITIALIZE_BASELINE'}
                  <div className="h-[2px] w-12 bg-primary rounded-full" />
                </h3>
                <p className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                  Drop legacy manifestos or <span className="text-primary">select node</span> to map neural identity
                </p>
                <p className="text-[0.55rem] font-black text-zinc-600 uppercase tracking-[0.2em]">Protocols: PDF • DOCX • TXT • MD</p>
              </div>

              {uploadedFile && !isUploading && (
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.6rem] font-black uppercase tracking-widest animate-fade-in">
                  <FileText size={14} className="animate-pulse" /> {uploadedFile} Synchronized
                </div>
              )}
              
              <input ref={fileRef} type="file" accept=".txt,.md,.pdf,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} style={{ display: 'none' }} />
              
              {/* Corner tech accents */}
              <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-white/10 group-hover:border-primary/40 transition-colors" />
              <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-white/10 group-hover:border-primary/40 transition-colors" />
              <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-white/10 group-hover:border-primary/40 transition-colors" />
              <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-white/10 group-hover:border-primary/40 transition-colors" />
            </div>

            {uploadMsg && (
              <div className={`p-4 rounded-2xl text-[0.65rem] font-black uppercase tracking-[0.2em] text-center border animate-in slide-in-from-top-2 duration-300 ${uploadMsg.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {uploadMsg}
              </div>
            )}

            <div className="flex items-center gap-8 py-4 opacity-50">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[0.55rem] font-black uppercase tracking-[0.4em] text-zinc-600 font-heading">OR_START_FRESH</span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <div className="flex flex-col gap-5">
              <button 
                type="button" 
                onClick={nextStep} 
                className="w-full py-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-4 text-[0.7rem] font-black uppercase tracking-[0.3em] font-heading group shadow-2xl"
              >
                <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-white transition-colors">
                  <ChevronRight size={18} className="text-zinc-500 group-hover:text-white" />
                </div>
                NEURAL_STRETCH_PROTOCOL
              </button>
              
              <button 
                type="button" 
                onClick={handleMagicBaseline} 
                className="w-full py-6 rounded-2xl bg-primary text-white border border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 text-[0.7rem] font-black uppercase tracking-[0.3em] font-heading relative overflow-hidden group"
                disabled={loadingSuggestion === 'magicBaseline'}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                {loadingSuggestion === 'magicBaseline' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} className="text-white group-hover:animate-bounce" />
                )}
                <span>MAGIC_BASELINE_SYNC</span>
                <span className="px-2 py-0.5 bg-white text-primary text-[0.45rem] font-black rounded ml-2 group-hover:scale-110 transition-transform tracking-widest leading-none">V_2.0</span>
              </button>
              
              <p className="text-[0.55rem] text-zinc-600 font-black uppercase tracking-[0.2em] text-center italic">
                Cognitive synthesis maps optimal role trajectory instantly.
              </p>
            </div>
          </div>
        )}

        {/* === STEP 1: IDENTITY PROTOCOL (PERSONAL) === */}
        {step === 1 && (
          <div className="flex flex-col gap-10 animate-fade-in">
            <PersonalSection 
              data={data.personal} 
              template={data.template} 
              updatePersonal={store.updatePersonal} 
            />

            {/* System Configuration & Templates */}
            <div className="group rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10">
              <div className="flex items-center justify-between gap-4 p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Shield size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] font-heading">SYSTEM_CONFIG</h3>
                    <p className="text-[0.55rem] font-bold text-zinc-500 uppercase tracking-widest">Interface & Visual Protocols</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                       <FileText size={12} className="text-primary" /> MANIFESTO_TITLE
                    </label>
                    <DebouncedInput 
                      type="text" 
                      value={data.title} 
                      onChangeValue={(v) => store.updateField('title', v)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all outline-none" 
                      placeholder="e.g. SENIOR_SWE_ALPHA" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                       <Zap size={12} className="text-primary" /> CHROMA_KEY
                    </label>
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <input 
                          type="color" 
                          value={data.themeColor} 
                          onChange={(e) => store.updateField('themeColor', e.target.value)} 
                          className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 p-1 cursor-pointer absolute opacity-0 z-10" 
                        />
                        <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center p-1" style={{ backgroundColor: data.themeColor }}>
                          <div className="w-full h-full rounded-lg bg-black/20 backdrop-blur-sm" />
                        </div>
                      </div>
                      <DebouncedInput 
                        type="text" 
                        value={data.themeColor} 
                        onChangeValue={(v) => store.updateField('themeColor', v)} 
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:border-primary/50 outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                       <Code size={12} className="text-primary" /> TYPOGRAPHY_CORE
                    </label>
                    <select 
                      value={data.fontFamily} 
                      onChange={(e) => store.updateField('fontFamily', e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Inter" className="bg-zinc-900">INTER_SANS</option>
                      <option value="Roboto" className="bg-zinc-900">ROBOTO_OS</option>
                      <option value="Open Sans" className="bg-zinc-900">OPEN_SANS</option>
                      <option value="Serif" className="bg-zinc-900">CLASSIC_SERIF</option>
                      <option value="Monospace" className="bg-zinc-900">JETBRAINS_MONO</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <span className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-zinc-500">VISUAL_SCHEMATICS</span>
                     <div className="h-[1px] flex-1 bg-white/5" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {TEMPLATES.map(t => (
                      <button 
                        key={t.id} 
                        type="button" 
                        className={`relative group/tmpl rounded-2xl overflow-hidden border transition-all aspect-[3/4] ${
                          data.template === t.id ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-white/5 hover:border-white/20'
                        }`} 
                        onClick={() => store.updateField('template', t.id)}
                      >
                        <img src={`/api/templates/${t.id}`} alt={t.name} className="object-cover w-full h-full opacity-60 group-hover/tmpl:opacity-100 transition-opacity" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                          <span className="text-[0.55rem] font-black uppercase tracking-widest text-white leading-tight">{t.name}</span>
                        </div>
                        {data.template === t.id && (
                          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                            <Check size={10} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === STEP 2: TARGETING PARAMETERS (TARGET & SKILLS) === */}
        {step === 2 && (
          <div className="flex flex-col gap-10 animate-fade-in">
            {data.jobDescription && data.skills.length === 0 && (
              <AutoTriggerSkillExtract jd={data.jobDescription} fetchSuggestion={fetchSuggestion} />
            )}
            <TargetAndSkillsSection
              targetRole={data.targetRole}
              jobDescription={data.jobDescription}
              updateField={store.updateField}
              loadingSuggestion={loadingSuggestion}
              fetchSuggestion={fetchSuggestion}
              handleAddChip={handleAddChip}
              onSkillsChange={onSkillsChange}
              SuggestionBubble={SuggestionBubble}
              skillInput={skillInput}
              setSkillInput={setSkillInput}
              handleSuggestTargetRoles={handleSuggestTargetRoles}
              handleExtractKeywords={handleExtractKeywords}
            />

            <div className="group rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10">
              <div className="flex items-center justify-between gap-4 p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Code size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] font-heading">NEURAL_STACK</h3>
                    <p className="text-[0.55rem] font-bold text-zinc-500 uppercase tracking-widest">Skill mapping & Suggestion Hub</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => fetchSuggestion('skills', data.targetRole || data.skills.join(', ') || 'general')} 
                  disabled={loadingSuggestion === 'skills'} 
                  className="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[0.6rem] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  {loadingSuggestion === 'skills' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AI_MAP_SKILLS
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-400">INPUT_PROTOCOL</label>
                  <div className="flex items-center gap-3">
                    <DebouncedInput 
                      type="text" 
                      value={skillInput} 
                      onChangeValue={val => setSkillInput(val)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); handleAddChip('skills', skillInput, setSkillInput); onSkillsChange(); } }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm focus:border-primary/50 outline-none transition-all placeholder:text-zinc-600 font-medium" 
                      placeholder="e.g. REACT_JS, DYNAMO_DB..." 
                      delay={10} 
                    />
                    <button 
                      type="button" 
                      onClick={() => { handleAddChip('skills', skillInput, setSkillInput); onSkillsChange(); }} 
                      className="w-14 h-14 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {data.skills.length > 0 && (
                  <div className="space-y-4">
                     <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-600">ACTIVE_NODES</span>
                     <div className="flex flex-wrap gap-2">
                        {data.skills.map((s, i) => (
                          <div key={i} className="group/chip inline-flex items-center gap-2 rounded-xl border border-white/5 bg-white/2 px-4 py-2 text-[0.65rem] font-black uppercase tracking-widest text-zinc-300 hover:border-primary/30 transition-all">
                            {s}
                            <button type="button" onClick={() => store.removeChip('skills', i)} className="text-zinc-600 hover:text-red-400 transition-colors"><X size={12} strokeWidth={3} /></button>
                          </div>
                        ))}
                     </div>
                  </div>
                )}
                
                <SuggestionBubble field="skills" />

                {data.jobDescription && (
                  <button 
                    type="button" 
                    onClick={() => fetchSuggestion('skills', `Extract the most important technical skills and keywords from this JD: ${data.jobDescription.substring(0, 500)}`)} 
                    disabled={loadingSuggestion === 'skills'} 
                    className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[0.6rem] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-3"
                  >
                    <Target size={14} /> EXTRACT_KEYWORDS (JD_SCAN)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === STEP 3: OPERATIONAL HISTORY (EXPERIENCE) === */}
        {step === 3 && (
          <div className="animate-fade-in">
            <ExperienceSection 
               handleRewriteBullets={handleRewriteBullets} 
               handleGenerateRoleBullets={handleGenerateRoleBullets} 
               bulletLoading={bulletLoading} 
               experience={data.experience}
               updateWork={store.updateWork}
               moveWork={store.moveWorkEntry}
               addWorkEntry={store.addWorkEntry}
               removeWorkEntry={store.removeWorkEntry}
               updateBullet={store.updateBullet}
               removeBullet={store.removeBullet}
               addBullet={store.addBullet}
            />
          </div>
        )}

        {/* === STEP 4: SECTOR ARCHIVES (PROJECTS & EDUCATION) === */}
        {step === 4 && (
          <div className="flex flex-col gap-12 animate-fade-in">
             <div className="relative group">
               <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/50 via-transparent to-transparent" />
               <ProjectsSection 
                handleRewriteProjectDesc={handleRewriteProjectDesc}
                handleSuggestTechStack={handleSuggestTechStack}
                loadingSuggestion={loadingSuggestion}
                projects={data.projects}
                updateProject={store.updateProject}
                moveProject={store.moveProject}
                addProject={store.addProject}
                removeProject={store.removeProject}
              />
            </div>

            <div className="relative group">
              <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/50 via-transparent to-transparent" />
              <EducationSection 
                education={data.education}
                updateEducation={store.updateEducation}
                moveEducation={store.moveEducation}
                addEducation={store.addEducation}
                removeEducation={store.removeEducation}
                handleSuggestCoursework={handleSuggestCoursework}
                loadingSuggestion={loadingSuggestion}
              />
            </div>
          </div>
        )}

        {/* === STEP 5: NEURAL FINALIZATION (REVIEW) === */}
        {step === 5 && (
          <div className="flex flex-col gap-10 animate-fade-in">
            {!reviewResult && !reviewLoading && (
              <AutoTriggerReview handleReviewReadiness={handleReviewReadiness} />
            )}
            
            <div className="group rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10">
              <div className="flex items-center justify-between gap-4 p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[0.65rem] font-black uppercase tracking-[0.3em] font-heading">SYNTACTIC_SUMMARY</h3>
                    <p className="text-[0.55rem] font-bold text-zinc-500 uppercase tracking-widest">Neural Narrative Synthesis</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={generateSummary} 
                  disabled={summaryLoading} 
                  className="px-6 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[0.6rem] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  {summaryLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  INITIALIZE_SUMMARY_GEN
                </button>
              </div>
              <div className="p-8 space-y-4">
                <DebouncedTextarea 
                  value={data.summary} 
                  onChangeValue={(val: string) => store.updateField('summary', val)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none min-h-[120px] leading-relaxed placeholder:text-zinc-700" 
                  placeholder="Initiate professional narrative protocol..." 
                  delay={500} 
                />
                <p className="text-[0.55rem] text-zinc-500 font-black uppercase tracking-[0.2em] italic">Synthesis requires baseline neural mapping to be accurate.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="group rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10">
                  <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <Award size={18} className="text-primary" />
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] font-heading">ENDORSEMENTS</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={certInput} 
                        onChange={e => setCertInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChip('certifications', certInput, setCertInput); } }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-primary/50 outline-none transition-all placeholder:text-zinc-700" 
                        placeholder="CERTIFICATION_ID" 
                      />
                      <button type="button" onClick={() => handleAddChip('certifications', certInput, setCertInput)} className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {data.certifications.map((c, i) => (
                         <div key={i} className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[0.6rem] font-bold text-zinc-400">
                           {c}
                           <button type="button" onClick={() => store.removeChip('certifications', i)} className="hover:text-red-400"><X size={10} /></button>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>

               <div className="group rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden transition-all hover:border-white/10">
                  <div className="p-8 border-b border-white/5 flex items-center gap-4">
                    <Languages size={18} className="text-primary" />
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] font-heading">LINGUISTIC_NODES</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <input 
                        type="text" 
                        value={langInput} 
                        onChange={e => setLangInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddChip('languages', langInput, setLangInput); } }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:border-primary/50 outline-none transition-all placeholder:text-zinc-700" 
                        placeholder="LANGUAGE_PROTOCOL" 
                      />
                      <button type="button" onClick={() => handleAddChip('languages', langInput, setLangInput)} className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><Plus size={18} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {data.languages.map((l, i) => (
                         <div key={i} className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-[0.6rem] font-bold text-zinc-400">
                           {l}
                           <button type="button" onClick={() => store.removeChip('languages', i)} className="hover:text-red-400"><X size={10} /></button>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>

            {reviewResult && (
              <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30" />
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 relative">
                     <CheckCircle2 size={28} />
                     <div className="absolute -inset-1 border border-emerald-500/20 rounded-2xl animate-ping opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-emerald-400 font-heading">Neural Audit Verified</p>
                    <p className="text-[0.65rem] text-emerald-500/60 font-medium uppercase tracking-widest">Integrity Index: {reviewResult.projectedScore}% • Efficiency Nominal</p>
                  </div>
                </div>
                {reviewResult.canAutoFix && (
                  <button type="button" onClick={handleApplyAllFixes} disabled={!!fixingType} className="px-8 py-3 bg-emerald-500 text-white rounded-xl text-[0.6rem] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 transition-all shadow-lg active:scale-95">
                    {fixingType ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />} EXECUTE_AUTO_FIX
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* === ORBITAL NAVIGATION FOOTER === */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button 
                type="button" 
                onClick={prevStep} 
                className="px-8 py-4 rounded-xl border border-white/10 text-zinc-400 text-[0.65rem] font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-white/5 hover:text-white transition-all group font-heading"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                RETREAT
              </button>
            )}
            
            {step > 0 && (
              <button 
                type="button" 
                onClick={() => setShowConfirmReset(true)}
                className="w-14 h-14 rounded-xl border border-red-500/20 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center group" 
                title="RE_INITIALIZE_CORE"
              >
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
              </button>
            )}
          </div>
          
          <div className="flex-1 flex justify-center md:justify-end gap-5">
            {!isLastStep ? (
              <button 
                type="button" 
                onClick={nextStep} 
                disabled={!canProceed(step)} 
                className="px-12 py-5 rounded-2xl bg-primary text-white text-[0.7rem] font-black uppercase tracking-[0.4em] flex items-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 font-heading"
              >
                ADVANCE <ChevronRight size={18} />
              </button>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  type="button" 
                  onClick={handleGenerateCoverLetter} 
                  disabled={coverLetterLoading || !canProceed(1)} 
                  className="px-8 py-4 rounded-xl border border-primary/30 text-primary text-[0.65rem] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary/5 transition-all font-heading"
                >
                  {coverLetterLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  INIT_COVER_LETTER
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveDraft} 
                  disabled={isSavingDraft || !canProceed(1) || !canProceed(2)} 
                  className="px-8 py-4 rounded-xl border border-emerald-500/30 text-emerald-500 text-[0.65rem] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-500/5 transition-all font-heading"
                >
                  {isSavingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  SAVE_SECURE_DRAFT
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || !canProceed(1) || !canProceed(2)} 
                  className="px-10 py-5 rounded-2xl bg-primary text-white text-[0.7rem] font-black uppercase tracking-[0.4em] flex items-center gap-4 shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:scale-[1.05] active:scale-95 transition-all font-heading"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  INITIALIZE_CONSTRUCTION
                </button>
              </div>
            )}
          </div>
        </div>

        {Object.keys(validationErrors).length > 0 && (
          <div className="mt-12 p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/20 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/30" />
            <h3 className="flex items-center gap-4 text-red-400 text-[0.7rem] font-black uppercase tracking-[0.3em] font-heading mb-6">
              <AlertTriangle size={20} /> VALIDATION_ANOMALIES_DETECTED
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {Object.entries(validationErrors).map(([section, errors]) => (
                <div key={section} className="flex gap-4 items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mt-1.5" />
                   <div className="space-y-1">
                     <p className="text-[0.65rem] font-black uppercase tracking-widest text-zinc-400">{section}</p>
                     <p className="text-[0.65rem] text-red-400/80 font-medium italic">{errors.join(' ')}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {coverLetter && (
          <div className="mt-12 p-10 rounded-[3rem] orbital-glass border border-primary/20 animate-fade-in relative group bg-primary/2 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[0.8rem] font-black uppercase tracking-[0.4em] font-heading text-white">Neural Cover Letter Proxy</h3>
                  <p className="text-[0.55rem] font-bold text-zinc-500 uppercase tracking-widest">Cognitive output • Editable Buffer</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => { navigator.clipboard.writeText(coverLetter); }} 
                className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[0.55rem] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Check size={12} /> COPY_BUFFER
              </button>
            </div>
            <textarea 
              value={coverLetter} 
              onChange={(e) => setCoverLetter(e.target.value)} 
              className="w-full bg-white/5 border border-white/5 rounded-2xl p-8 text-sm leading-relaxed text-zinc-300 min-h-[400px] outline-none focus:border-primary/20 transition-all custom-scrollbar resize-none font-medium" 
            />
          </div>
        )}
      </form>

      {/* Custom Confirm Reset Modal */}
      {showConfirmReset && typeof document !== 'undefined' && createPortal(
        <div className="resume-modal-overlay">
          <div className="resume-modal-content" style={{ maxWidth: '450px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--error)' }}>Start Fresh?</h3>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
              Are you sure you want to clear all form data and start a new resume from scratch? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button type="button" onClick={() => setShowConfirmReset(false)} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 px-6 py-3 text-base">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  store.resetForm();
                  setCoverLetter(null);
                  setShowConfirmReset(false);
                }} 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 py-3 text-base"
                style={{ background: 'var(--error)', borderColor: 'var(--error)' }}
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
