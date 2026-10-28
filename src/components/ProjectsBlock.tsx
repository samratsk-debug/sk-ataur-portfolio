import { useState } from 'react';
import type { SectionItem } from '../types';
import { Editable } from './Editable';
import { DetailModal } from './DetailModal';
import { normalizeExternalUrl } from '../utils/url';

function hueFor(title: string): number { return Array.from(title).reduce((a, c) => a + c.charCodeAt(0), 0) % 360; }
function initialOf(title: string): string { return (title.replace(/[^A-Za-z0-9]/g, '')[0] || '•').toUpperCase(); }
function pickImage(onPick: (file: File) => void) { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = () => { const file = input.files?.[0]; if (file) onPick(file); }; input.click(); }

export function ProjectsBlock({ items, path, editing, filter, showFilter, usedSkills, onFilter, onSkillClick, onText, onSkillsChange, onAdd, onRemove, onUploadImage }: { items: SectionItem[]; path: string; editing: boolean; filter: string; showFilter: boolean; usedSkills: string[]; onFilter: (v: string) => void; onSkillClick: (n: string) => void; onText: (p: string, v: string) => void; onSkillsChange: (p: string, s: string[]) => void; onAdd: () => void; onRemove: (p: string) => void; onUploadImage: (p: string, f: File) => void; }) {
  const [modalState, setModalState] = useState<{ item: SectionItem, rect: DOMRect } | null>(null);
  const activeFilter = editing ? '' : filter; 
  const visibleCount = items.filter((t) => !activeFilter || t.skills.includes(activeFilter)).length;

  const handleCardClick = (e: React.MouseEvent<HTMLElement>, item: SectionItem) => {
    if (editing) return;
    // Ensure clicks on links, buttons, or inputs don't trigger the modal
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setModalState({ item, rect });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, item: SectionItem) => {
    if (editing) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if ((e.target as HTMLElement).closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
      const rect = e.currentTarget.getBoundingClientRect();
      setModalState({ item, rect });
    }
  };

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        {showFilter && !editing && (
          <div className="fbar" role="group" aria-label="Filter projects" style={{ marginBottom: 8 }}>
            <button type="button" aria-pressed={!activeFilter} onClick={() => onFilter('')}>All</button>
            {usedSkills.map((k) => <button key={k} type="button" aria-pressed={activeFilter === k} onClick={() => onFilter(k)}>{k}</button>)}
          </div>
        )}
        {!editing && (
          <span className="hint" style={{ display: 'block', fontSize: 12 }}>click on a project to expand</span>
        )}
      </div>

      <div className="pwrap">
        <div className="pgrid">
          {items.map((t, j) => {
            const visible = !activeFilter || t.skills.includes(activeFilter); 
            const hue = hueFor(t.title);
            const thumbStyle = t.img ? { backgroundImage: `url(${t.img})` } : { background: `linear-gradient(135deg, hsl(${hue},70%,56%), hsl(${(hue + 55) % 360},72%,34%))` };
            const itemPath = `${path}.items.${j}`;
            
            const primaryLink = normalizeExternalUrl(t.repoUrl || t.demoUrl || t.externalUrl);
            const linkLabel = t.externalUrl ? 'View Work →' : 'View Project →';

            return (
              <article 
                key={j} 
                className="pc" 
                hidden={!visible}
                onClick={(e) => handleCardClick(e, t)}
                onKeyDown={(e) => handleKeyDown(e, t)}
                tabIndex={editing ? -1 : 0}
                role={editing ? undefined : 'button'}
              >
                <div className="th" style={thumbStyle}>{!t.img && <span>{initialOf(t.title)}</span>}</div>
                <div className="pb">
                  <div className="ph">
                    <b><Editable value={t.title} path={`${itemPath}.title`} editable={editing} onChange={onText} /></b>
                    <span className="dm"><Editable value={t.date} path={`${itemPath}.date`} editable={editing} onChange={onText} /></span>
                  </div>
                  
                  <span className="ptext"><Editable value={t.text} path={`${itemPath}.text`} editable={editing} onChange={onText} /></span>
                  
                  {!editing && primaryLink && (
                    <a 
                      href={primaryLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="pc-link"
                    >
                      {linkLabel}
                    </a>
                  )}

                  {editing && (
                    <div className="pc-edit-controls">
                      <label>Full Details<textarea value={t.fullText || ''} onChange={(e) => onText(`${itemPath}.fullText`, e.target.value)} rows={3} /></label>
                      <input className="skedit" type="text" defaultValue={t.skills.join(', ')} placeholder="Skills, comma separated" onBlur={(e) => onSkillsChange(`${itemPath}.skills`, e.currentTarget.value.split(',').map((s) => s.trim()).filter(Boolean))} />
                      <button type="button" className="x" onClick={(e) => { e.stopPropagation(); onRemove(itemPath); }}>×</button>
                      <button type="button" className="add up" onClick={(e) => { e.stopPropagation(); pickImage((file) => onUploadImage(`${itemPath}.img`, file)); }}>{t.img ? 'Replace' : 'Upload'}</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {visibleCount === 0 && <p className="empty">No items for this skill yet.</p>}
      </div>
      {editing && <button type="button" className="add" onClick={onAdd}>+ Add item</button>}
      
      <DetailModal 
        item={modalState?.item || null} 
        rect={modalState?.rect || null} 
        onClose={() => setModalState(null)} 
      />
    </>
  );
}