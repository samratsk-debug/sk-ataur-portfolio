import { describe, it, expect } from 'vitest';
import { portfolioData } from '../data/portfolio';

describe('portfolioData', () => {
  it('has the correct version', () => {
    expect(portfolioData.version).toBe(2);
  });

  it('has a valid profile', () => {
    expect(portfolioData.profile.name).toBe('SK ATAUR RAHAMAN');
    expect(portfolioData.profile.email).toBeTruthy();
  });

  it('has at least one project and one skill', () => {
    expect(portfolioData.projects.length).toBeGreaterThan(0);
    expect(portfolioData.skills.length).toBeGreaterThan(0);
  });
});