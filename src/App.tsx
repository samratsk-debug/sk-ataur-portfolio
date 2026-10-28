import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePortfolioSession } from './hooks/usePortfolioSession';
import { useRoute } from './hooks/useRoute';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useIsMobile } from './hooks/useIsMobile';
import { useResumeCamera } from './hooks/useResumeCamera';
import { buildSections } from './data/viewModel';
import { portfolioData } from './data/portfolio';
import type { PortfolioData } from './types';
import { Background } from './components/Background';
import { Nav } from './components/Nav';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { SkillsBlock } from './components/SkillsBlock';
import { ProjectsBlock } from './components/ProjectsBlock';
import { ItemsBlock } from './components/ItemsBlock';
import { EditorApp } from './editor/EditorApp';
import { SignInModal } from './editor/SignInModal';
import { PortfolioSkeleton } from './components/Skeletons';

export default function App() {
  const route = useRoute();
  const session = usePortfolioSession();
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (session.loading) {
      const t = setTimeout(() => setShowSkeleton(true), 150);
      return () => clearTimeout(t);
    } else {
      setShowSkeleton(false);
    }
  }, [session.loading]);

  if (session.error && !session.published) return <FatalError message={session.error} />;
  
  if (session.loading && !session.published) {
    return showSkeleton ? <PortfolioSkeleton /> : <div style={{ background: 'var(--navy)', minHeight: '100vh' }} />;
  }
  
  const isOwner = session.session?.user.role === 'owner';
  const showDraft = route === 'preview' && isOwner && session.draft !== null;
  const data = showDraft ? session.draft! : session.published ?? portfolioData;

  // Route Guard: If user tries to access /admin but is not an owner, 
  // render the public site with the login modal forced open.
  if (route === 'admin') {
    if (isOwner) {
      return <EditorApp session={session} />;
    } else {
      return <PublicSite data={data} preview={false} session={session} forceLoginModal={true} />;
    }
  }

  return <PublicSite data={data} preview={showDraft} session={session} />;
}

function FatalError({ message }: { message: string }) {
  return (
    <><Background />
      <div className="fatal-error">
        <h1>Portfolio not configured</h1>
        <p>{message}</p>
        <p className="muted">Create <code>.env.local</code> with <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</p>
      </div>
    </>
  );
}

function PublicSite({ data, preview, session, forceLoginModal = false }: { data: PortfolioData; preview: boolean; session: any; forceLoginModal?: boolean }) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  useResumeCamera(reducedMotion);

  const [isLoginOpen, setIsLoginOpen] = useState(forceLoginModal);

  // CRITICAL FIX: This effect listens for route changes and forces the modal open
  // immediately if the user navigates to #/admin while already on the page.
  useEffect(() => {
    if (forceLoginModal) {
      setIsLoginOpen(true);
    }
  }, [forceLoginModal]);

  const sections = useMemo(() => buildSections(data), [data]);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [activeId, setActiveId] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(-1);

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const go = useCallback((id: string) => {
    if (id === 'top') { window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); return; }
    setOpenIds((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }, [reducedMotion]);

  const idsKey = sections.map((s) => s.id).join('|');
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const els = idsKey.split('|').map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
        if (!els.length) return;
        const scrollY = window.scrollY;
        const threshold = 150; 
        let current = els[0].id;
        for (const el of els) {
          if (el.offsetTop - threshold <= scrollY) current = el.id;
        }
        if (window.innerHeight + scrollY >= document.body.offsetHeight - 50) current = els[els.length - 1].id;
        setActiveId(prev => prev === current ? prev : current);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener('scroll', onScroll); if(raf) cancelAnimationFrame(raf); };
  }, [idsKey]);

  const pressRef = useRef({ startX: 0, startY: 0, isDragging: false });
  const handlePointerDown = (e: React.PointerEvent) => {
    if (reducedMotion || (e.target as HTMLElement).closest('button, a, input, [contenteditable], .modal-overlay, .modal-backdrop')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    pressRef.current = { startX: e.clientX, startY: e.clientY, isDragging: false };
    if ((window as any).setPaperPressure) (window as any).setPaperPressure(x * 4, y * -4);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (pressRef.current.isDragging) return;
    const dx = Math.abs(e.clientX - pressRef.current.startX);
    const dy = Math.abs(e.clientY - pressRef.current.startY);
    if (dx > 10 || dy > 10) {
      pressRef.current.isDragging = true;
      if ((window as any).releasePaperPressure) (window as any).releasePaperPressure();
    }
  };
  const handlePointerUp = () => {
    if (!pressRef.current.isDragging && (window as any).releasePaperPressure) (window as any).releasePaperPressure();
  };

  const skillCountFor = useCallback((name: string) => data.projects.filter((p) => (p.skillIds || []).some((sid) => data.skills.find((s) => s.id === sid)?.name === name)).length, [data]);
  const usedSkills = useMemo(() => data.skills.filter((s) => data.projects.some((p) => (p.skillIds || []).includes(s.id))).map((s) => s.name), [data]);

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    if (forceLoginModal) {
      window.location.hash = '#/'; // Redirect back to home if they close the forced modal
    }
  };

  return (
    <>
      <Background />
      <div className="edge-fade" aria-hidden="true" />
      
      {isLoginOpen && <SignInModal session={session} onClose={handleCloseLogin} />}

      <Nav 
        sections={sections.map((s) => ({ id: s.id, title: s.title }))} 
        active={activeId} 
        onGo={go} 
        resume={data.resume} 
      />
      
      <main className="scroll-area" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        {preview && (
          <div className="preview-banner-container">
            <div className="preview-banner glass-panel chromatic-border">
              <span>Previewing saved draft</span>
              <a href="#/admin">Return to Editor</a>
            </div>
          </div>
        )}

        <div className="paper-stage">
          <div className="paper-cam">
            <article className="paper">
              <Header 
                profile={data.profile} editable={false} onUploadPhoto={() => undefined} onRemovePhoto={() => undefined} onOpenLogin={() => setIsLoginOpen(true)} 
              />
              {sections.map((section, index) => (
                <Section key={section.id} index={index} section={section} path={`sections.${index}`} open={openIds.has(section.id)} editing={false} onToggle={() => toggle(section.id)} onText={() => undefined}>
                  {section.chips && <SkillsBlock chips={section.chips} path="" editing={false} selected={selectedSkill} onSelect={(i) => setSelectedSkill((p) => (p === i ? -1 : i))} countFor={skillCountFor} onViewRelated={(name) => { setProjectFilter(name); go('projects'); }} onText={() => undefined} onAdd={() => undefined} onRemove={() => undefined} />}
                  {section.cards && section.items && <ProjectsBlock items={section.items} path="" editing={false} filter={projectFilter} showFilter={section.id === 'projects'} usedSkills={usedSkills} onFilter={setProjectFilter} onSkillClick={(name) => { setProjectFilter(name); go('projects'); }} onText={() => undefined} onSkillsChange={() => undefined} onAdd={() => undefined} onRemove={() => undefined} onUploadImage={() => undefined} />}
                  {!section.cards && section.items && <ItemsBlock items={section.items} path="" editing={false} onText={() => undefined} onAdd={() => undefined} onRemove={() => undefined} />}
                </Section>
              ))}
            </article>
          </div>
        </div>
      </main>
    </>
  );
}