import type { PortfolioData, SocialLink, ContactEntry } from '../types';

export function migrateData(data: PortfolioData): PortfolioData {
  if (data.version >= 6) return data;

  const skillMap = new Map((data.skills || []).map(s => [s.name.toLowerCase(), s.id]));
  
  const migratedProjects = (data.projects || []).map(p => {
    const skillIds = p.skillIds || [];
    const legacyTags = (p as any).tags as string[] | undefined;
    if (legacyTags && legacyTags.length > 0) {
      legacyTags.forEach(tag => {
        const id = skillMap.get(tag.toLowerCase());
        if (id && !skillIds.includes(id)) skillIds.push(id);
      });
    }
    return { ...p, skillIds, tags: undefined };
  });

  const migratedCreative = (data.creative || []).map(c => {
    const skillIds = c.skillIds || [];
    const legacyTags = (c as any).tags as string[] | undefined;
    if (legacyTags && legacyTags.length > 0) {
      legacyTags.forEach(tag => {
        const id = skillMap.get(tag.toLowerCase());
        if (id && !skillIds.includes(id)) skillIds.push(id);
      });
    }
    return { ...c, skillIds, tags: undefined };
  });

  const oldProfile = data.profile as any;
  const migratedSocialLinks: SocialLink[] = [];
  
  if (oldProfile.socials) {
    if (oldProfile.socials.github) migratedSocialLinks.push({ id: 'social-github', label: 'GitHub', url: oldProfile.socials.github });
    if (oldProfile.socials.linkedin) migratedSocialLinks.push({ id: 'social-linkedin', label: 'LinkedIn', url: oldProfile.socials.linkedin });
    if (oldProfile.socials.portfolio) migratedSocialLinks.push({ id: 'social-portfolio', label: 'Portfolio', url: oldProfile.socials.portfolio });
  }
  
  if (oldProfile.customLinks && Array.isArray(oldProfile.customLinks)) {
    oldProfile.customLinks.forEach((link: any, i: number) => {
      if (link.url) {
        migratedSocialLinks.push({ id: `social-custom-${Date.now()}-${i}`, label: link.label || 'Link', url: link.url });
      }
    });
  }

  // Migrate old contact fields to new array
  const migratedContacts: ContactEntry[] = oldProfile.contacts || [];
  if (oldProfile.email && !migratedContacts.find(c => c.value === oldProfile.email)) {
    migratedContacts.push({ id: 'c-email', label: 'Email', type: 'email', value: oldProfile.email });
  }
  if (oldProfile.phone && !migratedContacts.find(c => c.value === oldProfile.phone)) {
    migratedContacts.push({ id: 'c-phone', label: 'Phone', type: 'phone', value: oldProfile.phone });
  }
  if (oldProfile.location && !migratedContacts.find(c => c.value === oldProfile.location)) {
    migratedContacts.push({ id: 'c-loc', label: 'Location', type: 'address', value: oldProfile.location });
  }

  return {
    ...data,
    version: 6,
    profile: {
      ...data.profile,
      socialLinks: data.profile.socialLinks || migratedSocialLinks,
      contacts: migratedContacts,
      email: undefined,
      phone: undefined,
      location: undefined,
      socials: undefined,
      customLinks: undefined
    },
    projects: migratedProjects,
    creative: migratedCreative,
    customSections: (data.customSections || []).map(cs => ({
      ...cs,
      type: cs.type || 'informational',
      content: cs.content || '',
      items: cs.items || []
    }))
  };
}