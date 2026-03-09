import React, { useRef, memo } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Trash2, Sparkles } from 'lucide-react';
import { DebouncedInput } from '@/components/DebouncedInput';
import { AIBadge } from '@/components/AIBadge';
import { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData['personal'];
  template: ResumeData['template'];
  updatePersonal: (field: keyof ResumeData['personal'], value: string) => void;
}

export const PersonalSection = memo(function PersonalSection({ data, template, updatePersonal }: Props) {
  const profileImageRef = useRef<HTMLInputElement>(null);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updatePersonal('profileImage', reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = ''; // Allow re-uploading the same file
  };

  return (
    <div className="flex flex-col gap-10 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group space-y-3">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <User size={12} /> SUBJECT_DESIGNATION <span className="text-primary/50 text-[0.4rem]">*</span>
          </label>
          <DebouncedInput
            type="text"
            value={data.fullName}
            onChangeValue={(value) => updatePersonal('fullName', value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
            placeholder="Jane Doe"
            required
            delay={250}
          />
        </div>
        <div className="group space-y-3">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <Mail size={12} /> COMMUNICATION_UPLINK <span className="text-primary/50 text-[0.4rem]">*</span>
          </label>
          <DebouncedInput
            type="email"
            value={data.email}
            onChangeValue={(value) => updatePersonal('email', value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
            placeholder="jane@example.com"
            delay={250}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group space-y-3">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <Phone size={12} /> VOICE_FREQ
          </label>
          <DebouncedInput
            type="tel"
            value={data.phone}
            onChangeValue={(value) => updatePersonal('phone', value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
            placeholder="+1 234 567 8900"
            delay={250}
          />
        </div>
        <div className="group space-y-3">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <MapPin size={12} /> ORIGIN_COORDINATES
          </label>
          <DebouncedInput
            type="text"
            value={data.location}
            onChangeValue={(value) => updatePersonal('location', value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
            placeholder="San Francisco, CA"
            delay={250}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
              <Linkedin size={12} /> NET_PROTOCOL_LI
            </label>
            {data.linkedin && !data.linkedin.startsWith('http') && (
              <button 
                type="button"
                onClick={() => updatePersonal('linkedin', `https://${data.linkedin.replace(/^(http:\/\/|https:\/\/)/, '')}`)}
                className="text-[0.5rem] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
              >
                <Sparkles size={10} /> AUTO_FIX
              </button>
            )}
          </div>
          <DebouncedInput
            type="text"
            value={data.linkedin}
            onChangeValue={(value) => updatePersonal('linkedin', value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
            placeholder="linkedin.com/in/janedoe"
            delay={250}
          />
        </div>
        <div className="group space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
              <Github size={12} /> NET_PROTOCOL_GH
            </label>
            {data.github && !data.github.startsWith('http') && (
              <button 
                type="button"
                onClick={() => updatePersonal('github', `https://${data.github.replace(/^(http:\/\/|https:\/\/)/, '')}`)}
                className="text-[0.5rem] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
              >
                <Sparkles size={10} /> AUTO_FIX
              </button>
            )}
          </div>
          <DebouncedInput
            type="text"
            value={data.github}
            onChangeValue={(value) => updatePersonal('github', value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
            placeholder="github.com/janedoe"
            delay={250}
          />
        </div>
      </div>

      <div className="group space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-primary transition-colors flex items-center gap-3">
            <Globe size={12} /> DIGITAL_ARCHIVE (PORTFOLIO)
          </label>
          {data.portfolio && !data.portfolio.startsWith('http') && (
            <button 
              type="button"
              onClick={() => updatePersonal('portfolio', `https://${data.portfolio.replace(/^(http:\/\/|https:\/\/)/, '')}`)}
              className="text-[0.5rem] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
            >
              <Sparkles size={10} /> AUTO_FIX
            </button>
          )}
        </div>
        <DebouncedInput
          type="text"
          value={data.portfolio}
          onChangeValue={(value) => updatePersonal('portfolio', value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 transition-all outline-none font-medium placeholder:text-zinc-700 shadow-inner"
          placeholder="https://janedoe.dev"
          delay={250}
        />
      </div>

      {template === 'modern' && (
        <div className="relative group p-10 rounded-[3rem] bg-white/2 border border-dashed border-white/10 hover:border-primary/30 transition-all overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-4">
              <span className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-zinc-600 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 hover:text-primary hover:border-primary/20 transition-all">VISUAL_UID_REQUIRED</span>
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative">
                {data.profileImage ? (
                  <div className="relative w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-primary/20 group-hover:border-primary/50 transition-all shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                    <img src={data.profileImage} alt="Profile preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      className="absolute inset-0 bg-zinc-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                      onClick={() => updatePersonal('profileImage', '')}
                    >
                      <Trash2 size={24} className="hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-950/50 border-2 border-white/5 flex items-center justify-center text-zinc-800 transition-all group-hover:border-primary/10 group-hover:text-primary/20">
                    <User size={48} />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all active:scale-95" onClick={() => profileImageRef.current?.click()}>
                   <Sparkles size={18} />
                </div>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">BIOMETRIC_VISUAL_FEED</h3>
                   <p className="text-[0.65rem] text-zinc-500 font-medium leading-relaxed max-w-sm uppercase tracking-widest mt-2">Initialize identity render for Modern Protocol layers. Square aspect ratio (1:1) recommended for optimal mapping.</p>
                </div>
                <button 
                  type="button" 
                  className="px-8 py-3 rounded-xl border border-white/10 text-white text-[0.6rem] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all font-heading"
                  onClick={() => profileImageRef.current?.click()}
                >
                  {data.profileImage ? 'REMAP_IMAGE' : 'INIT_VISUAL_UPLOAD'}
                </button>
                <input type="file" ref={profileImageRef} onChange={handleProfileImageUpload} accept="image/png, image/jpeg, image/webp" className="hidden" />
              </div>
           </div>
        </div>
      )}

    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.template === nextProps.template &&
         JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});
