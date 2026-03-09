import React from 'react';
import { ResumeData } from '@/types/resume';

export function BoldTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper bg-black text-white p-10" style={{ fontFamily: data.fontFamily || 'sans-serif' }}>
      <header className="mb-8">
        <h1 className="text-5xl font-black text-pink-500 tracking-tighter uppercase mb-2 leading-none">{personal.fullName}</h1>
        {data.targetRole && <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-4">{data.targetRole}</h2>}
        <div className="text-sm font-medium text-pink-200 flex flex-col gap-1">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </header>

      {summary && (
        <section className="mb-8 p-4 bg-pink-900/30 border-l-4 border-pink-500">
          <p className="text-[0.9em] leading-relaxed text-pink-50 font-medium">{summary}</p>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[1.2em] font-black uppercase text-pink-500 tracking-widest mb-4">Experience</h2>
          <div className="flex flex-col gap-6">
            {experience.map(exp => (
              <div key={exp.id}>
                <h3 className="text-[1.1em] font-black text-white bg-pink-600 inline-block px-3 py-1 mb-2">{exp.jobTitle}</h3>
                <div className="text-[0.9em] font-bold text-pink-300 mb-2">{exp.company} <span className="opacity-50 mx-2">|</span> {exp.startDate} - {exp.endDate || 'Present'}</div>
                {exp.bullets && (
                  <ul className="list-disc pl-5 text-[0.85em] text-pink-50 space-y-1">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[1.2em] font-black uppercase text-pink-500 tracking-widest mb-4">Education</h2>
          <div className="grid grid-cols-2 gap-4">
            {education.map(edu => (
              <div key={edu.id} className="p-4 border border-pink-500/30">
                <div className="text-[0.9em] font-black text-white">{edu.degree}</div>
                <div className="text-[0.8em] font-bold text-pink-400 mt-1">{edu.institution}</div>
                <div className="text-[0.75em] text-pink-200 mt-2">{edu.year}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
