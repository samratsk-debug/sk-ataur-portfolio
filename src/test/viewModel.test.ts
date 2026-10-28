import { describe, it, expect } from 'vitest';
import { buildSections } from '../data/viewModel';
import { portfolioData } from '../data/portfolio';

describe('buildSections', () => {
  it('returns the six expected sections', () => {
    const sections = buildSections(portfolioData);
    expect(sections).toHaveLength(6);
    const ids = sections.map((s) => s.id);
    expect(ids).toEqual(['about', 'skills', 'projects', 'creative', 'education', 'contact']);
  });

  it('maps project items correctly', () => {
    const sections = buildSections(portfolioData);
    const projects = sections.find((s) => s.id === 'projects');
    expect(projects).toBeDefined();
    expect(projects?.items?.[0].title).toBe('RelayChat — LLM Chatbot');
    expect(projects?.items?.[0].skills).toContain('Angular & React');
  });

  it('maps skills into chips', () => {
    const sections = buildSections(portfolioData);
    const skills = sections.find((s) => s.id === 'skills');
    expect(skills?.chips?.[0].name).toBe('C Programming');
  });
});