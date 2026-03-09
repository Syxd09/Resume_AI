import React from 'react';
import { ResumeData } from '@/types/resume';

export function StartupTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'Inter, sans-serif' }}>
      <header className="mb-6 bg-rose-500 text-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-black tracking-tight mb-2">{personal.fullName}</h1>
        {data.targetRole && <h2 className="text-rose-100 font-medium text-lg mb-3">{data.targetRole}</h2>}
        <div className="text-[0.85em] text-rose-100 flex flex-wrap gap-4 font-medium">
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.email && <span>✉️ {personal.email}</span>}
          {personal.linkedin && <span>🔗 {personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
        </div>
      </header>

      {summary && (
        <section className="mb-6 px-2">
          <p className="text-[0.9em] leading-relaxed text-slate-800 font-medium">{summary}</p>
        </section>
      )}

      {skills && skills.length > 0 && (
        <section className="mb-6 px-2">
          <div className="flex flex-wrap gap-2 text-[0.8em] font-bold text-rose-600">
            {skills.map((s, i) => <span key={i} className="px-3 py-1 bg-rose-50 rounded-full border border-rose-100">{s}</span>)}
          </div>
        </section>
      )}

      <div className="flex gap-6 px-2">
        <div className="w-2/3">
          {experience && experience.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[1.1em] font-black text-slate-900 mb-4 flex items-center gap-2">🚀 Experience</h2>
              <div className="flex flex-col gap-5 text-slate-800">
                {experience.map(exp => (
                  <div key={exp.id} className="relative pl-4 border-l-2 border-rose-200">
                    <div className="absolute w-3 h-3 bg-rose-500 rounded-full -left-[7px] top-1 border-2 border-white"></div>
                    <div className="text-[0.95em] font-bold text-slate-900">{exp.jobTitle}</div>
                    <div className="text-[0.85em] font-semibold text-rose-600 mb-1">{exp.company} <span className="text-slate-400 font-medium ml-2">{exp.startDate} - {exp.endDate || 'Present'}</span></div>
                    {exp.bullets && (
                      <ul className="list-disc pl-4 text-[0.85em] space-y-1">
                        {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="w-1/3">
          {education && education.length > 0 && (
            <section className="mb-6">
              <h2 className="text-[1.1em] font-black text-slate-900 mb-4 flex items-center gap-2">🎓 Education</h2>
              <div className="flex flex-col gap-4 text-slate-800">
                {education.map(edu => (
                  <div key={edu.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[0.85em] font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-[0.8em] text-slate-600">{edu.institution}</div>
                    <div className="text-[0.75em] text-slate-400 font-medium mt-1">{edu.year}</div>
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
