export interface AssetRef {
  assetId: string;
  path: string;
  bucket: string;
  url: string;
  mime?: string;
  size?: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export type ContactType = 'email' | 'phone' | 'address' | 'website' | 'text';

export interface ContactEntry {
  id: string;
  label: string;
  type: ContactType;
  value: string;
}

export interface Profile {
  name: string;
  role: string;
  about: string;
  kicker: string;
  contacts: ContactEntry[];
  socialLinks: SocialLink[];
  photo: AssetRef | null;
}

export interface ResumeDoc {
  url: string;
  path: string;
  filename: string;
  size: number;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  desc: string;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  text: string;
  fullText: string;
  category: string;
  skillIds: string[];
  repoUrl: string;
  demoUrl: string;
  thumb: AssetRef | null;
}

export interface CreativePiece {
  id: string;
  title: string;
  kind: string;
  caption: string;
  text: string;
  fullText: string;
  image: AssetRef | null;
  externalUrl: string;
  skillIds?: string[];
}

export interface EducationEntry {
  id: string;
  title: string;
  institution: string;
  course: string;
  date: string;
  grade: string;
  text: string;
}

export interface CustomSection {
  id: string;
  title: string;
  summary: string;
  type: 'informational' | 'collection';
  content: string;
  items: SectionItem[];
}

export interface PortfolioData {
  version: number;
  updatedAt: string;
  publishedAt: string | null;
  profile: Profile;
  resume: ResumeDoc | null;
  sectionOrder: string[];
  customSections: CustomSection[];
  skills: Skill[];
  projects: Project[];
  creative: CreativePiece[];
  education: EducationEntry[];
}

export interface PublicUser {
  id: string;
  email: string;
  role: 'owner' | 'visitor';
}

export interface Session {
  user: PublicUser;
}

export interface SkillChip { name: string; desc: string; }

export interface SectionItem {
  id?: string;
  title: string;
  date: string;
  text: string;
  fullText?: string;
  skills: string[];
  img: string;
  repoUrl?: string;
  demoUrl?: string;
  category?: string;
  tags?: string[];
  externalUrl?: string;
}

export interface SectionData {
  id: string;
  title: string;
  summary: string;
  preview: string;
  detail: string;
  noun?: string;
  cards?: boolean;
  chips?: SkillChip[];
  items?: SectionItem[];
}