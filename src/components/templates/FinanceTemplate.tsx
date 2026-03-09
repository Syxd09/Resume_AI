import React from 'react';
import { ResumeData } from '@/types/resume';

export function FinanceTemplate({ data }: { data: ResumeData }) {
  const { personal, summary, experience, education, projects, skills } = data;
  return (
    <div className="resume-paper" style={{ fontFamily: data.fontFamily || 'Arial, sans-serif', padding: '1.5in 1in' }}>
      <header className="mb-4 text-center border-b-[3px] border-black pb-3">
        <h1 className="text-[1.8rem] font-bold text-black uppercase">{personal.fullName}</h1>
        <div className="text-[0.8em] font-semibold text-black mt-1 flex justify-center gap-x-2">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>| {personal.phone}</span>}
          {personal.linkedin && <span>| {personal.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
        </div>
      </header>

      {experience && experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[0.85em] font-bold uppercase text-black mb-1 border-b border-black">Work Experience</h2>
          <div className="flex flex-col gap-3 mt-1">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[0.85em] font-bold text-black">{exp.company}</h3>
                  <span className="text-[0.8em] text-black">{exp.location} | {exp.startDate} – {exp.endDate || 'Present'}</span>
                </div>
                <div className="text-[0.85em] italic text-black mb-1">{exp.jobTitle}</div>
                {exp.bullets && (
                  <ul className="list-disc pl-4 text-[0.8em] text-black space-y-0.5">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {education && education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[0.85em] font-bold uppercase text-black mb-1 border-b border-black">Education</h2>
          <div className="flex flex-col gap-2 mt-1">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-[0.85em] font-bold text-black">{edu.institution}</h3>
                  <div className="text-[0.8em] text-black">{edu.degree} {edu.gpa && `| GPA: ${edu.gpa}`}</div>
                </div>
                <span className="text-[0.8em] text-black">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills && skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-[0.85em] font-bold uppercase text-black mb-1 border-b border-black">Skills & Interests</h2>
          <div className="text-[0.8em] text-black mt-1">
            <span className="font-bold">Technical Skills: </span> {skills.join(', ')}
          </div>
        </section>
      )}
    </div>
  );
}
