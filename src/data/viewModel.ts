import type { PortfolioData, SectionData, SectionItem, ContactEntry } from '../types';

export function buildSections(data: PortfolioData): SectionData[] {
  const skillName = new Map(data.skills.map((s) => [s.id, s.name]));
  
  const projectItems: SectionItem[] = data.projects.map((p) => ({
    id: p.id, 
    title: p.title, 
    date: p.date, 
    text: p.text, 
    fullText: p.fullText,
    skills: (p.skillIds || []).map((id) => skillName.get(id) ?? '').filter(Boolean),
    img: p.thumb?.url ?? '', 
    repoUrl: p.repoUrl, 
    demoUrl: p.demoUrl, 
    category: p.category
  }));

  const creativeItems: SectionItem[] = data.creative.map((c) => ({
    id: c.id, 
    title: c.title, 
    date: c.kind, 
    text: c.text, 
    fullText: c.fullText,
    skills: (c.skillIds || []).map((id) => skillName.get(id) ?? '').filter(Boolean), 
    img: c.image?.url ?? '', 
    externalUrl: c.externalUrl
  }));

  const educationItems: SectionItem[] = data.education.map((e) => ({
    id: e.id, 
    title: e.title, 
    date: e.date, 
    text: [e.institution, e.course, e.grade, e.text].filter(Boolean).join('\n'),
    skills: [], 
    img: ''
  }));

  // Format dynamic contact entries for the public section
  const contactLines = (data.profile.contacts || []).map(c => {
    const prefix = c.label ? `${c.label}: ` : '';
    return `${prefix}${c.value}`;
  });

  const skillsPreview = data.skills.slice(0, 4).map((s) => s.name).join(', ') + (data.skills.length > 4 ? ', …' : '');

  const defaultSections: Record<string, SectionData> = {
    about: { id: 'about', title: 'About', summary: 'Computer Science undergraduate', preview: data.profile.about.split('\n')[0].slice(0, 140), detail: data.profile.about },
    skills: { id: 'skills', title: 'Skills', summary: 'Code and creative', preview: skillsPreview, detail: 'Select a skill to see how I use it.', chips: data.skills.map((s) => ({ name: s.name, desc: s.desc })) },
    projects: { id: 'projects', title: 'Projects & Experience', summary: 'Web, C and cloud work', preview: 'Full stack web apps, C programming practice and cloud computing.', detail: 'Hands-on work from coursework and personal projects.', noun: 'project', cards: true, items: projectItems },
    creative: { id: 'creative', title: 'Creative Work', summary: 'Photo, video, design and editing', preview: 'Photography, videography, graphic design and editing.', detail: 'A look at my creative side.', noun: 'piece', cards: true, items: creativeItems },
    education: { id: 'education', title: 'Education', summary: 'B.Tech, SRM University AP', preview: 'B.Tech in Computer Science and Engineering at SRM University AP.', detail: 'Education and academic background.', noun: 'entry', items: educationItems },
    contact: { id: 'contact', title: 'Contact', summary: 'Ways to reach me', preview: 'Email, phone and location.', detail: contactLines.join('\n') }
  };

  const finalSections: SectionData[] = [];
  const order = data.sectionOrder || ['about', 'skills', 'projects', 'creative', 'education', 'contact'];

  for (const id of order) {
    if (defaultSections[id]) {
      finalSections.push(defaultSections[id]);
    } else {
      const custom = (data.customSections || []).find(c => c.id === id);
      if (custom) {
        if (custom.type === 'collection') {
          const items = (custom.items || []).map(item => ({
            ...item,
            skills: (item.skills || [])
          }));
          finalSections.push({
            id: custom.id, title: custom.title, summary: custom.summary, preview: custom.summary, detail: 'Collection', noun: 'item', cards: true, items
          });
        } else {
          finalSections.push({
            id: custom.id, title: custom.title, summary: custom.summary, preview: custom.summary, detail: custom.content
          });
        }
      }
    }
  }

  return finalSections;
}