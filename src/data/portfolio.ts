import type { PortfolioData } from '../types';

export const portfolioData: PortfolioData = {
  version: 6,
  updatedAt: new Date(0).toISOString(),
  publishedAt: null,
  sectionOrder: ['about', 'skills', 'projects', 'creative', 'education', 'contact'],
  customSections: [],
  resume: null,
  profile: {
    name: 'SK ATAUR RAHAMAN',
    role: 'Full Stack Developer',
    kicker: 'CURRICULUM VITAE',
    about: 'Computer Science undergraduate at SRM University–AP with a foundation in C, C++, Java, and web technologies. Building practical skills through coursework and personal projects, with an interest in software development and cloud computing.\nAlongside code, I work with videography, photography, graphic design and editing.',
    contacts: [
      { id: 'c-email', label: 'Email', type: 'email', value: 'samratskk69@gmail.com' },
      { id: 'c-phone', label: 'Phone', type: 'phone', value: '+91 8250186791' },
      { id: 'c-loc', label: 'Location', type: 'address', value: 'Murshidabad, West Bengal' }
    ],
    socialLinks: [],
    photo: null,
  },
  skills: [
    { id: 'sk-c', name: 'C Programming', desc: 'Built console programs using arrays, functions, and control flow.' },
    { id: 'sk-dsa', name: 'DSA in C', desc: 'Practiced DSA, recursion, problem-solving, and debugging.' },
    { id: 'sk-oop', name: 'C++ & Java (OOP)', desc: 'Currently learning Object Oriented Programming with C++ and Java.' },
    { id: 'sk-web', name: 'HTML · CSS · JS', desc: 'Used for building websites and full stack web applications.' },
    { id: 'sk-ngrx', name: 'Angular & React', desc: 'Front-end frameworks for building web applications.' },
    { id: 'sk-spring', name: 'Spring Boot · PostgreSQL · JWT', desc: 'Back end, database and authentication for full stack applications.' },
    { id: 'sk-cloud', name: 'Cloud Computing', desc: 'Currently starting to learn Cloud Computing.' },
    { id: 'sk-photo', name: 'Photography', desc: 'Photography as a creative practice.' },
    { id: 'sk-video', name: 'Videography', desc: 'Video capture and visual storytelling.' },
    { id: 'sk-design', name: 'Graphic Design', desc: 'Graphic design and visual communication.' },
    { id: 'sk-edit', name: 'Editing', desc: 'Photo and video editing.' }
  ],
  projects: [
    { id: 'pr-relay', title: 'RelayChat — LLM Chatbot', date: 'Oct 2026', text: 'Built and deployed a full-stack chatbot.', fullText: 'Built and deployed a full-stack chatbot using Angular, Spring Boot, PostgreSQL and the Gemini API. Implemented authentication and tested the deployed application with multiple users.', category: 'Full stack', skillIds: ['sk-ngrx', 'sk-spring'], repoUrl: '', demoUrl: '', thumb: null },
    { id: 'pr-dist', title: 'DistMeasure — Distance Widget', date: '', text: 'Built a full-stack distance-tracking application.', fullText: 'Built a full-stack distance-tracking application using Angular, Spring Boot and PostgreSQL, with geolocation and distance calculation features.', category: 'Full stack', skillIds: ['sk-ngrx', 'sk-spring'], repoUrl: '', demoUrl: '', thumb: null },
    { id: 'pr-web', title: 'Web Development', date: '2026 – Present', text: 'Developed full-stack web applications.', fullText: 'Developed full-stack web applications and deployed working prototypes. Began creating informational websites for small businesses.', category: 'Full stack', skillIds: ['sk-web', 'sk-ngrx', 'sk-spring'], repoUrl: '', demoUrl: '', thumb: null },
    { id: 'pr-c', title: 'C Programming | Coursework', date: '2026 – Present', text: 'Built console programs using arrays and functions.', fullText: 'Built console programs using arrays, functions and control flow. Practiced DSA, recursion, problem-solving and debugging. Learning object-oriented programming with C++ and Java.', category: 'Coursework', skillIds: ['sk-c', 'sk-dsa', 'sk-oop'], repoUrl: '', demoUrl: '', thumb: null },
    { id: 'pr-cloud', title: 'Cloud Computing', date: 'Oct 2026', text: 'Beginning to learn cloud computing fundamentals.', fullText: 'Beginning to learn cloud computing fundamentals.', category: 'Learning', skillIds: ['sk-cloud'], repoUrl: '', demoUrl: '', thumb: null }
  ],
  creative: [
    { id: 'cr-photo', title: 'Photography', kind: 'Photography', caption: '', text: 'Visual composition.', fullText: 'Photography and visual composition.', image: null, externalUrl: '' },
    { id: 'cr-video', title: 'Videography', kind: 'Videography', caption: '', text: 'Visual storytelling.', fullText: 'Video capture and visual storytelling.', image: null, externalUrl: '' },
    { id: 'cr-design', title: 'Graphic Design', kind: 'Graphic Design', caption: '', text: 'Visual communication.', fullText: 'Graphic design and visual communication.', image: null, externalUrl: '' },
    { id: 'cr-edit', title: 'Editing', kind: 'Editing', caption: '', text: 'Photo and video editing.', fullText: 'Photo and video editing workflows.', image: null, externalUrl: '' }
  ],
  education: [
    { id: 'ed-btech', title: 'Bachelor of Technology', institution: 'SRM University AP', course: 'Computer Science and Engineering', date: 'Aug 2025 – May 2029', grade: 'CGPA: 8.3', text: '' },
    { id: 'ed-12', title: '10+2', institution: 'Kandi Raj High School', course: '', date: '2023 – 2024', grade: 'Passing percentage: 79%', text: '' }
  ]
};