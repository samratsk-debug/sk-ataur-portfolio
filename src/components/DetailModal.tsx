import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SectionItem } from '../types';
import { normalizeExternalUrl } from '../utils/url';

export function DetailModal({ item, rect, onClose }: { item: SectionItem | null; rect: DOMRect | null; onClose: () => void; }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!item || !rect) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [item, rect]);

  // FLIP Animation
  useLayoutEffect(() => {
    if (!item || !rect || !modalRef.current) return;
    const el = modalRef.current;

    // 1. First: Set initial position and scale to match the clicked card
    el.style.transition = 'none';
    el.style.position = 'fixed';
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    el.style.borderRadius = '16px'; // Match card radius
    el.style.opacity = '0';

    // 2. Last & Invert & Play: Animate to the final centered position
    requestAnimationFrame(() => {
      if (!el) return;
      setIsMounted(true); // Trigger content fade-in
      
      el.style.transition = 'all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
      
      // Calculate center position
      const finalWidth = Math.min(800, window.innerWidth - 32);
      const finalLeft = (window.innerWidth - finalWidth) / 2;
      const finalTop = Math.max(16, (window.innerHeight - 600) / 2); // approximate height
      
      el.style.left = `${finalLeft}px`;
      el.style.top = `${finalTop}px`;
      el.style.width = `${finalWidth}px`;
      el.style.height = 'auto';
      el.style.maxHeight = 'calc(100vh - 32px)';
      el.style.opacity = '1';
    });
  }, [item, rect]);

  const handleClose = () => {
    if (!modalRef.current) {
      onClose();
      return;
    }
    const el = modalRef.current;
    setIsMounted(false);
    
    // Animate back to original card position
    if (rect) {
      el.style.transition = 'all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.opacity = '0';
      
      setTimeout(onClose, 350);
    } else {
      onClose();
    }
  };

  if (!item || !rect) return null;

  const primaryUrl = normalizeExternalUrl(item.repoUrl || item.demoUrl || item.externalUrl);
  const linkLabel = item.externalUrl ? 'Open Link ↗' : item.repoUrl ? 'View Repository ↗' : 'Live Demo ↗';

  return createPortal(
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div 
        className={`modal-content glass-panel chromatic-border detail-modal ${isMounted ? 'mounted' : ''}`} 
        ref={modalRef} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
      >
        <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">×</button>
        
        {item.img ? (
          <div className="modal-hero">
            <img src={item.img} alt="" className="modal-header-img" />
          </div>
        ) : (
          <div className="modal-hero fallback-hero" style={{ background: `linear-gradient(135deg, #3A55C8, #1A214A)` }} />
        )}
        
        <div className="modal-body-scroll">
          <div className="modal-header">
            <h2 id="modal-title">{item.title}</h2>
            {item.date && <span className="modal-date">{item.date}</span>}
          </div>

          <div className="modal-text">
            {item.fullText ? item.fullText.split('\n').map((p, i) => <p key={i}>{p}</p>) : <p>{item.text}</p>}
          </div>

          {item.skills.length > 0 && (
            <div className="modal-tags">
              <h4>Skills Used</h4>
              <div className="tags">
                {item.skills.map(s => <span key={s} className="tg">{s}</span>)}
              </div>
            </div>
          )}

          {primaryUrl && (
            <div className="modal-footer">
              <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className="modal-link-btn">
                {linkLabel}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}