import React from 'react';
import { ResumeData } from '@/types/resume';

export function DataScientistTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'monospace', backgroundColor: '#f4fbf7' }}>
      <header className="mb-6 bg-emerald-900 text-emerald-50 p-6 shadow-md border-b-4 border-emerald-500">
        <h1 className="text-4xl font-black mb-1 tracking-tight">&gt; {personal.fullName}_</h1>
        {data.targetRole && <h2 className="text-emerald-300 font-bold mb-3">~/{data.targetRole.replace(/\s+/g, '-').toLowerCase()}</h2>}
        <div className="text-[0.8em] font-medium text-emerald-100/80 flex flex-wrap gap-x-5">
          {personal.location && <span>[loc] {personal.location}</span>}
          {personal.email && <span>[mail] {personal.email}</span>}
          {personal.github && <span>[git] {personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}</span>}
          {personal.linkedin && <span>[in] {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>}
        </div>
      </header>

      <div className="px-6 flex flex-col gap-6">
        {summary && (
          <section>
            <h2 className="text-[0.85em] font-black uppercase text-emerald-800 mb-2 border-b-2 border-emerald-200 pb-1">### Model Summary</h2>
            <p className="text-[0.85em] leading-relaxed text-emerald-950 font-sans">{summary}</p>
          </section>
        )}

        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-[0.85em] font-black uppercase text-emerald-800 mb-2 border-b-2 border-emerald-200 pb-1">### Features & Weights</h2>
            <div className="flex flex-wrap gap-2 text-[0.8em] font-bold">
              {skills.map((s, i) => <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">{s}</span>)}
            </div>
          </section>
        )}

        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-[0.85em] font-black uppercase text-emerald-800 mb-3 border-b-2 border-emerald-200 pb-1">### Execution Pipeline (Experience)</h2>
            <div className="flex flex-col gap-5">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[0.9em] font-black text-emerald-900">def <span className="text-emerald-600">{exp.company.replace(/\s+/g, '_')}</span>():</h3>
                    <span className="text-[0.75em] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">[{exp.startDate} : {exp.endDate || 'Present'}]</span>
                  </div>
                  <div className="text-[0.85em] font-bold text-emerald-800 ml-4 mb-2"># Role: {exp.jobTitle}</div>
                  {exp.bullets && (
                    <ul className="list-disc pl-8 text-[0.85em] text-emerald-950 space-y-1 font-sans">
                      {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-[0.85em] font-black uppercase text-emerald-800 mb-3 border-b-2 border-emerald-200 pb-1">### Model Architecture (Projects)</h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.map(proj => (
                <div key={proj.id} className="p-3 bg-white border border-emerald-200 rounded shadow-sm">
                  <div className="text-[0.85em] font-black text-emerald-900 mb-1">{proj.name}</div>
                  <div className="text-[0.7em] font-bold text-emerald-600 mb-2 bg-emerald-50 inline-block px-1 rounded">{proj.techStack}</div>
                  <p className="text-[0.8em] text-emerald-950 font-sans leading-tight">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education && education.length > 0 && (
          <section>
            <h2 className="text-[0.85em] font-black uppercase text-emerald-800 mb-3 border-b-2 border-emerald-200 pb-1">### Pre-training (Education)</h2>
            <div className="flex flex-col gap-3">
              {education.map(edu => (
                <div key={edu.id} className="flex justify-between items-baseline bg-emerald-50/50 p-2 rounded">
                  <div>
                    <h3 className="text-[0.85em] font-black text-emerald-900">{edu.degree}</h3>
                    <div className="text-[0.8em] text-emerald-800 mt-0.5">{edu.institution}</div>
                  </div>
                  <span className="text-[0.8em] font-bold text-emerald-700">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
