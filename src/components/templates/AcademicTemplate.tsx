import React from 'react';
import { ResumeData } from '@/types/resume';

export function AcademicTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'Georgia, serif' }}>
      <header className="mb-6 text-center border-b-[4px] border-double border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{personal.fullName}</h1>
        {data.targetRole && <h2 className="text-base italic text-slate-700 mb-2">{data.targetRole}</h2>}
        <div className="text-[0.8em] font-medium text-slate-600 flex justify-center gap-3">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
        </div>
      </header>

      {education && education.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.9em] font-bold uppercase tracking-wider text-slate-900 mb-2 bg-slate-100 px-2 py-1">Education</h2>
          <div className="flex flex-col gap-3 px-2 mt-2">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-[0.9em] font-bold text-slate-900">{edu.institution}</h3>
                  <div className="text-[0.85em] text-slate-800">{edu.degree}</div>
                  {edu.gpa && <div className="text-[0.8em] text-slate-600 mt-0.5">GPA: {edu.gpa}</div>}
                </div>
                <span className="text-[0.85em] font-bold text-slate-900">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {experience && experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-[0.9em] font-bold uppercase tracking-wider text-slate-900 mb-2 bg-slate-100 px-2 py-1">Academic & Professional Experience</h2>
          <div className="flex flex-col gap-4 px-2 mt-2">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[0.9em] font-bold text-slate-900">{exp.company}</h3>
                  <span className="text-[0.85em] font-bold text-slate-900">{exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-[0.85em] italic text-slate-800 mb-1">{exp.jobTitle}</div>
                {exp.bullets && (
                  <ul className="list-disc pl-5 text-[0.85em] text-slate-700 space-y-0.5 mt-1">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {summary && (
        <section className="mb-5">
          <h2 className="text-[0.9em] font-bold uppercase tracking-wider text-slate-900 mb-2 bg-slate-100 px-2 py-1">Research Interests & Summary</h2>
          <p className="text-[0.85em] leading-relaxed text-slate-800 px-2">{summary}</p>
        </section>
      )}
    </div>
  );
}
