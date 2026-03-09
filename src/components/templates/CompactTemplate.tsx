import React from 'react';
import { ResumeData } from '@/types/resume';

export function CompactTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper p-6" style={{ fontFamily: data.fontFamily || 'sans-serif' }}>
      <header className="mb-3 flex justify-between items-end border-b-2 border-slate-800 pb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-none">{personal.fullName}</h1>
          {data.targetRole && <h2 className="text-[0.9em] font-bold text-slate-600 mt-1 uppercase">{data.targetRole}</h2>}
        </div>
        <div className="text-[0.75em] text-right font-medium text-slate-700 flex flex-col items-end">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.linkedin && <span>{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')} | {personal.location}</span>}
        </div>
      </header>

      {summary && (
        <section className="mb-3">
          <p className="text-[0.8em] leading-tight text-slate-800">{summary}</p>
        </section>
      )}

      <div className="flex gap-4">
        <div className="w-2/3">
          {experience && experience.length > 0 && (
            <section className="mb-3">
              <h2 className="text-[0.85em] font-black uppercase text-slate-900 border-b border-slate-300 mb-1.5 pb-0.5">Experience</h2>
              <div className="flex flex-col gap-2.5">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline leading-none mb-0.5">
                      <h3 className="text-[0.85em] font-bold text-slate-900">{exp.company}</h3>
                      <span className="text-[0.75em] font-semibold text-slate-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                    </div>
                    <div className="text-[0.8em] italic text-slate-700 mb-1 leading-none">{exp.jobTitle}</div>
                    {exp.bullets && (
                      <ul className="list-disc pl-4 text-[0.75em] text-slate-800 space-y-0.5">
                        {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects && projects.length > 0 && (
            <section className="mb-3">
              <h2 className="text-[0.85em] font-black uppercase text-slate-900 border-b border-slate-300 mb-1.5 pb-0.5">Projects</h2>
              <div className="flex flex-col gap-2">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-0.5 leading-none">
                      <h3 className="text-[0.8em] font-bold text-slate-900">{proj.name}</h3>
                      <span className="text-[0.7em] text-slate-500 font-mono">{proj.techStack}</span>
                    </div>
                    <p className="text-[0.75em] text-slate-700 leading-tight">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="w-1/3 border-l border-slate-200 pl-4">
          {skills && skills.length > 0 && (
            <section className="mb-4">
              <h2 className="text-[0.85em] font-black uppercase text-slate-900 border-b border-slate-300 mb-1.5 pb-0.5">Skills</h2>
              <div className="flex flex-col gap-0.5 text-[0.75em] text-slate-800 font-medium">
                {skills.map((s, i) => <div key={i}>• {s}</div>)}
              </div>
            </section>
          )}

          {education && education.length > 0 && (
            <section className="mb-4">
              <h2 className="text-[0.85em] font-black uppercase text-slate-900 border-b border-slate-300 mb-1.5 pb-0.5">Education</h2>
              <div className="flex flex-col gap-2">
                {education.map(edu => (
                  <div key={edu.id} className="leading-tight">
                    <div className="text-[0.8m] font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[0.75em] text-slate-700">{edu.institution}</div>
                    <div className="text-[0.7em] font-bold text-slate-500 mt-0.5">{edu.year}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
