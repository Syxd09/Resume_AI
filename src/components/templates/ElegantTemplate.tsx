import React from 'react';
import { ResumeData } from '@/types/resume';

export function ElegantTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'sans-serif' }}>
      <header className="mb-10 text-center">
        <h1 className="text-[2.5rem] font-light text-indigo-900 tracking-widest uppercase mb-1">{personal.fullName}</h1>
        <div className="w-16 h-1 bg-indigo-200 mx-auto my-4"></div>
        {data.targetRole && <h2 className="text-[0.9em] font-semibold text-indigo-600 tracking-[0.2em] uppercase mb-4">{data.targetRole}</h2>}
        <div className="text-[0.75em] text-slate-500 tracking-widest uppercase flex justify-center gap-4">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
        </div>
      </header>

      {summary && (
        <section className="mb-8 text-center px-12">
          <p className="text-[0.85em] leading-[1.8] text-slate-600">{summary}</p>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[0.8em] font-bold text-center uppercase tracking-[0.2em] text-indigo-900 mb-6">Experience</h2>
          <div className="flex flex-col gap-6 px-4">
            {experience.map(exp => (
              <div key={exp.id} className="text-center">
                <h3 className="text-[0.9em] font-bold text-slate-900 uppercase tracking-wider">{exp.jobTitle}</h3>
                <div className="text-[0.8em] text-indigo-600 font-medium my-1">{exp.company} <span className="text-slate-400 mx-2">|</span> {exp.startDate} - {exp.endDate || 'Present'}</div>
                {exp.bullets && (
                  <ul className="text-[0.8em] text-slate-600 leading-relaxed max-w-2xl mx-auto text-left list-none pt-2">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i} className="mb-1.5"><span className="text-indigo-300 mr-2">—</span>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-8 pt-4 border-t border-slate-100">
          <h2 className="text-[0.8em] font-bold text-center uppercase tracking-[0.2em] text-indigo-900 mb-6">Education</h2>
          <div className="grid grid-cols-2 gap-6 text-center px-4">
            {education.map(edu => (
              <div key={edu.id}>
                <h3 className="text-[0.85em] font-bold text-slate-900 uppercase tracking-widest">{edu.degree}</h3>
                <div className="text-[0.8em] text-slate-600 mt-1">{edu.institution}</div>
                <div className="text-[0.75em] text-indigo-400 mt-1">{edu.year}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
