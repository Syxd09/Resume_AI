import React from 'react';
import { ResumeData } from '@/types/resume';

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'Times New Roman, serif' }}>
      <header className="mb-6 text-center">
        <h1 className="text-[2.2rem] font-bold text-black mb-1 leading-tight">{personal.fullName}</h1>
        <div className="text-[0.85em] text-slate-700 flex flex-wrap justify-center gap-2 mb-2">
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && <><span className="text-slate-400">•</span><span>{personal.phone}</span></>}
          {personal.email && <><span className="text-slate-400">•</span><span>{personal.email}</span></>}
          {personal.linkedin && <><span className="text-slate-400">•</span><span>{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span></>}
        </div>
      </header>

      {summary && (
        <section className="mb-5">
          <h2 className="text-[0.9em] font-bold uppercase text-black mb-1 border-b border-black">Summary</h2>
          <p className="text-[0.85em] leading-relaxed text-black text-justify mt-2">{summary}</p>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.9em] font-bold uppercase text-black mb-1 border-b border-black">Experience</h2>
          <div className="flex flex-col gap-4 mt-2">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[0.9em] font-bold text-black">{exp.company}{exp.location && `, ${exp.location}`}</h3>
                  <span className="text-[0.85em] font-bold text-black">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-[0.85em] italic text-black mb-1">{exp.jobTitle}</div>
                {exp.bullets && (
                  <ul className="list-disc pl-5 text-[0.85em] text-black space-y-1">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.9em] font-bold uppercase text-black mb-1 border-b border-black">Education</h2>
          <div className="flex flex-col gap-2 mt-2">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-[0.9em] font-bold text-black">{edu.institution}</h3>
                  <div className="text-[0.85em] text-black">{edu.degree}</div>
                </div>
                <span className="text-[0.85em] font-bold text-black">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
