// ============================================================
// Resume Builder v2 — Structured Data Types
// ============================================================

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    profileImage?: string; // Base64 encoded image string
}

export interface WorkEntry {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string; // "Present" for current
    bullets: string[];
}

export interface ProjectEntry {
    id: string;
    name: string;
    techStack: string;
    description: string;
    link: string;
}

export interface EducationEntry {
    id: string;
    degree: string;
    institution: string;
    year: string;
    gpa: string;
    coursework?: string;
}

export type ResumeTemplate = 'professional' | 'modern' | 'minimal' | 'executive' | 'creative' | 'tech' | 'startup' | 'academic' | 'classic' | 'bold' | 'elegant' | 'compact' | 'datascientist' | 'designer' | 'finance';

export interface ResumeData {
    personal: PersonalInfo;
    summary: string;
    targetRole: string;
    jobDescription: string;
    skills: string[];
    experience: WorkEntry[];
    projects: ProjectEntry[];
    education: EducationEntry[];
    certifications: string[];
    languages: string[];
    template: ResumeTemplate;
    title: string;
    themeColor: string;
    fontFamily: string;
}

// Factory helpers
export const createWorkEntry = (): WorkEntry => ({
    id: crypto.randomUUID(),
    jobTitle: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    bullets: [''],
});

export const createProjectEntry = (): ProjectEntry => ({
    id: crypto.randomUUID(),
    name: '',
    techStack: '',
    description: '',
    link: '',
});

export const createEducationEntry = (): EducationEntry => ({
    id: crypto.randomUUID(),
    degree: '',
    institution: '',
    year: '',
    gpa: '',
    coursework: '',
});

export const emptyResumeData: ResumeData = {
    personal: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        profileImage: '',
    },
    summary: '',
    targetRole: '',
    jobDescription: '',
    skills: [],
    experience: [createWorkEntry()],
    projects: [],
    education: [createEducationEntry()],
    certifications: [],
    languages: [],
    template: 'professional',
    title: 'My Professional Resume',
    themeColor: '#000000',
    fontFamily: 'Inter',
};
