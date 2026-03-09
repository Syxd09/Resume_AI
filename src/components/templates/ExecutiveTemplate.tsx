import React from 'react';
import { ResumeData } from '@/types/resume';

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'Georgia, serif' }}>
      <header className="mb-8 border-b-4 border-slate-900 pb-6 text-center">
        <h1 className="text-4xl font-extrabold uppercase tracking-widest text-slate-900 mb-2">{personal.fullName}</h1>
        {data.targetRole && <h2 className="text-lg font-bold tracking-widest text-slate-700 uppercase mb-4">{data.targetRole}</h2>}
        <div className="text-sm font-medium text-slate-600 flex flex-wrap justify-center gap-4">
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.linkedin && <span>{personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
        </div>
      </header>

      {summary && (
        <section className="mb-6">
          <p className="text-[0.95em] leading-relaxed text-slate-800 font-medium text-justify">{summary}</p>
        </section>
      )}

      {skills && skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-2 border-b-2 border-slate-900 pb-1">Executive Competencies</h2>
          <div className="flex flex-wrap gap-2 text-[0.85em] font-semibold text-slate-700">
            {skills.map((s, i) => <span key={i} className="px-2 py-1 bg-slate-100 rounded border border-slate-200">{s}</span>)}
          </div>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-3 border-b-2 border-slate-900 pb-1">Professional Experience</h2>
          <div className="flex flex-col gap-5">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[1em] font-bold text-slate-900 uppercase tracking-wide">{exp.company}</h3>
                  <span className="text-[0.85em] font-bold text-slate-700 uppercase tracking-wider">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-[0.9em] font-semibold text-slate-700 mb-2">{exp.jobTitle}{exp.location && `, ${exp.location}`}</div>
                {exp.bullets && (
                  <ul className="list-disc pl-5 text-[0.85em] text-slate-800 space-y-1">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects omitted for extreme brevity in executive context, or simplified */}
      
      {education && education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-900 mb-3 border-b-2 border-slate-900 pb-1">Education</h2>
          <div className="flex flex-col gap-3">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-[0.95em] font-bold text-slate-900">{edu.institution}</h3>
                  <div className="text-[0.85em] text-slate-800">{edu.degree}</div>
                </div>
                <span className="text-[0.85em] font-bold text-slate-700">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
