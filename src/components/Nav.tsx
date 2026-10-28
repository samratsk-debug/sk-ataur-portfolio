import { useEffect, useRef } from 'react';
import type { ResumeDoc } from '../types';

interface NavSection { id: string; title: string; }

export function Nav({ sections, active, onGo, resume }: { sections: NavSection[]; active: string; onGo: (id: string) => void; resume: ResumeDoc | null; }) {
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = linksRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Only scroll horizontally if there is overflow
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const isAtStart = el.scrollLeft === 0 && e.deltaY < 0;
          const isAtEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth && e.deltaY > 0;
          if (!isAtStart && !isAtEnd) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }
        }
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleDownloadClick = (e: React.MouseEvent) => {
    if (!resume) {
      e.preventDefault();
      alert("No resume uploaded yet. Please check back later.");
    }
  };

  return (
    <nav className="glass" aria-label="Resume sections">
      <div id="links" ref={linksRef}>
        {sections.map((s) => (
          <button key={s.id} type="button" className={active === s.id ? 'on' : ''} onClick={() => onGo(s.id)}>
            {s.title}
          </button>
        ))}
      </div>
      
      <a 
        href={resume ? resume.url : '#'} 
        download={resume ? "SK_Ataur_Rahaman_Resume.pdf" : undefined}
        onClick={handleDownloadClick}
        className="pdf"
        target={resume ? "_blank" : undefined}
        rel={resume ? "noopener noreferrer" : undefined}
        style={{ cursor: resume ? 'pointer' : 'not-allowed', opacity: resume ? 1 : 0.6 }}
      >
        Download Resume
      </a>
    </nav>
  );
}