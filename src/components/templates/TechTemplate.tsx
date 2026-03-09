import React from 'react';
import { ResumeData } from '@/types/resume';

export function TechTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'monospace', backgroundColor: '#fdfdfd' }}>
      <header className="mb-6 pb-4 border-b border-blue-400">
        <h1 className="text-3xl font-bold text-blue-900 mb-1">{personal.fullName} <span className="text-blue-500 font-normal opacity-50">&lt;/&gt;</span></h1>
        {data.targetRole && <h2 className="text-base text-blue-700 mb-2 font-mono">{data.targetRole}</h2>}
        <div className="text-[0.8rem] text-slate-600 font-mono flex flex-wrap gap-x-4">
          {personal.email && <span>{personal.email}</span>}
          {personal.github && <span>github.com/{personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>}
          {personal.linkedin && <span>linkedin.com/in/{personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>}
          {personal.portfolio && <span>{personal.portfolio}</span>}
        </div>
      </header>

      {skills && skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.8rem] uppercase tracking-widest text-blue-900 font-bold mb-2">++ Skills</h2>
          <p className="text-[0.85em] text-slate-800 font-mono">{skills.join(' | ')}</p>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.8rem] uppercase tracking-widest text-blue-900 font-bold mb-3 border-b border-blue-100 pb-1">++ Work_Experience</h2>
          <div className="flex flex-col gap-4">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[0.9em] font-bold text-slate-900">{exp.jobTitle} <span className="text-blue-600 font-normal">@ {exp.company}</span></h3>
                  <span className="text-[0.8rem] text-slate-500 font-mono">{exp.startDate} - {exp.endDate || 'Present'}</span>
                </div>
                {exp.bullets && (
                  <ul className="list-disc pl-4 text-[0.8rem] text-slate-700 space-y-1 font-sans">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {projects && projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.8rem] uppercase tracking-widest text-blue-900 font-bold mb-3 border-b border-blue-100 pb-1">++ Projects</h2>
          <div className="flex flex-col gap-3">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[0.9em] font-bold text-slate-900">{proj.name}</h3>
                  <span className="text-[0.75rem] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">{proj.techStack}</span>
                </div>
                <p className="text-[0.8rem] text-slate-700 font-sans">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.8rem] uppercase tracking-widest text-blue-900 font-bold mb-3 border-b border-blue-100 pb-1">++ Education</h2>
          <div className="flex flex-col gap-2">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div className="text-[0.85em] font-sans"><span className="font-bold text-slate-900">{edu.degree}</span>, {edu.institution}</div>
                <span className="text-[0.8rem] font-mono text-slate-500">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
