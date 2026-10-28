import type { ReactNode } from 'react';
import type { SectionData } from '../types';
import { Editable } from './Editable';

export function Section({ 
  index, section, path, open, editing, onToggle, onText, children 
}: { 
  index: number; section: SectionData; path: string; open: boolean; editing: boolean; 
  onToggle: () => void; onText: (p: string, v: string) => void; children?: ReactNode; 
}) {
  const titleId = `sec-title-${section.id}`; 
  const detailId = `sec-detail-${section.id}`;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
    // Trigger global camera hook
    if (typeof window !== 'undefined' && (window as any).triggerCameraImpulse) {
      (window as any).triggerCameraImpulse(open ? 'close' : 'open');
    }
  };

  return (
    <section id={section.id} className={`sec${open ? ' open' : ''}`} aria-labelledby={titleId}>
      <div className="hd" onClick={handleToggle}>
        <span className="no">{String(index + 1).padStart(2, '0')}</span>
        <span className="tt">
          <b id={titleId}><Editable value={section.title} path={`${path}.title`} editable={editing} onChange={onText} /></b>
          <span className="sm"><Editable value={section.summary} path={`${path}.summary`} editable={editing} onChange={onText} /></span>
        </span>
        <button 
          type="button" 
          className="pl" 
          aria-label={`${open ? 'Collapse' : 'Expand'} ${section.title}`} 
          aria-expanded={open} 
          aria-controls={detailId} 
          onClick={handleToggle}
        >
          {open ? '×' : '+'}
        </button>
      </div>
      <p className="pv"><Editable value={section.preview} path={`${path}.preview`} editable={editing} onChange={onText} /></p>
      <div className="dt" id={detailId} role="region" aria-labelledby={titleId}>
        <div className="in">
          <p className="detail"><Editable value={section.detail} path={`${path}.detail`} editable={editing} onChange={onText} /></p>
          {children}
        </div>
      </div>
    </section>
  );
}