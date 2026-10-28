import { Component, ErrorInfo, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import type { PortfolioData } from '../types';
import type { SessionApi } from '../hooks/usePortfolioSession';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { Toaster, useToasts } from './Toaster';
import { ProfileForm } from './forms/ProfileForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { CreativeForm } from './forms/CreativeForm';
import { EducationForm } from './forms/EducationForm';
import { SectionsForm } from './forms/SectionsForm';
import { ContactForm } from './forms/ContactForm';
import { EditorContext, type EditorApi } from './EditorContext';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'contact', label: 'Contact' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'creative', label: 'Creative' },
  { id: 'education', label: 'Education' },
  { id: 'sections', label: 'Sections' }
] as const;

type TabId = (typeof TABS)[number]['id'];

const EMPTY: PortfolioData = {
  version: 6, updatedAt: '', publishedAt: null,
  profile: { name: '', role: '', about: '', contacts: [], socialLinks: [], photo: null },
  resume: null, sectionOrder: ['about', 'skills', 'projects', 'creative', 'education', 'contact'], customSections: [],
  skills: [], projects: [], creative: [], education: [],
};

class TabErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Tab render error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return <div className="fatal-error" style={{ position: 'static', color: '#FF9B9B' }}>This tab encountered an error. Please try refreshing the page.</div>;
    }
    return this.props.children;
  }
}

export function EditorShell({ session }: { session: SessionApi }) {
  const initial = session.draft ?? session.published ?? EMPTY;
  const [draft, setDraft] = useState<PortfolioData>(() => structuredClone(initial));
  const [saved, setSaved] = useState<PortfolioData>(() => structuredClone(initial));
  const [tab, setTab] = useState<TabId>('profile');
  const [busy, setBusy] = useState<string | null>(null);
  const toasts = useToasts();

  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  useUnsavedChanges(dirty);

  useEffect(() => {
    if (session.draft && !dirty) {
      setDraft(structuredClone(session.draft));
      setSaved(structuredClone(session.draft));
    }
  }, [session.draft]);

  const update = (updater: (prev: PortfolioData) => PortfolioData) => setDraft(updater);
  const api: EditorApi = { draft, setDraft: update, dirty, uploadAsset: session.uploadAsset, deleteAsset: session.deleteAsset, toast: toasts.push };

  const onSave = async (): Promise<boolean> => {
    setBusy('save');
    const snapshot = structuredClone(draftRef.current);
    try {
      const s = await session.saveDraft(snapshot);
      const savedData = structuredClone(s);
      setSaved(savedData);
      setDraft(prev => JSON.stringify(prev) === JSON.stringify(snapshot) ? savedData : prev);
      toasts.push('Draft saved', 'ok');
      return true;
    } catch (e) {
      toasts.push(e instanceof Error ? e.message : 'Save failed', 'err');
      return false;
    } finally {
      setBusy(null);
    }
  };

  const onPreview = async () => {
    if (dirty) {
      const shouldSave = window.confirm("You have unsaved changes. Click OK to save and preview, or Cancel to discard unsaved changes and preview.");
      if (shouldSave) {
        const success = await onSave();
        if (!success) return;
      } else {
        setDraft(structuredClone(saved));
      }
    }
    window.location.hash = '#/preview';
  };

  const onPublish = async () => {
    if (dirty) {
      if (!confirm('You have unsaved changes. Save and publish?')) return;
      const success = await onSave();
      if (!success) return;
    }
    setBusy('publish');
    try {
      const dataToPublish = draftRef.current;
      const p = await session.publish(dataToPublish);
      const pub = structuredClone(p);
      setSaved(pub);
      setDraft(pub);
      toasts.push('Published successfully', 'ok');
    } catch (e) {
      toasts.push(e instanceof Error ? e.message : 'Publish failed', 'err');
    } finally {
      setBusy(null);
    }
  };

  const onCancel = () => {
    if (!dirty) return;
    if (!confirm('Discard all unsaved changes?')) return;
    setDraft(structuredClone(saved));
    toasts.push('Changes discarded', 'ok');
  };

  const onDiscardDraft = async () => {
    if (!confirm('Revert the saved draft to the currently published version?')) return;
    setBusy('discard');
    try {
      const d = await session.discardDraft();
      const draftData = structuredClone(d);
      setDraft(draftData);
      setSaved(draftData);
      toasts.push('Draft reverted to published', 'ok');
    } catch (e) {
      toasts.push(e instanceof Error ? e.message : 'Discard failed', 'err');
    } finally {
      setBusy(null);
    }
  };

  const onSignOut = async () => {
    if (dirty && !confirm('Log out and discard unsaved changes?')) return;
    await session.signOut();
    window.location.hash = '#/';
  };

  return (
    <EditorContext.Provider value={api}>
      <Toaster items={toasts.items} />
      <div className="editor-shell">
        <header className="editor-bar">
          <div className="editor-brand">
            <strong>Owner editor</strong>
            <span className="muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
          </div>
          <div className="editor-actions">
            <button type="button" onClick={onCancel} disabled={!dirty || busy !== null}>Cancel</button>
            <button type="button" onClick={onSave} disabled={!dirty || busy !== null}>{busy === 'save' ? 'Saving…' : 'Save Changes'}</button>
            <button type="button" onClick={onPreview} disabled={busy !== null}>Preview</button>
            <button type="button" onClick={onPublish} disabled={busy !== null} className="primary">{busy === 'publish' ? 'Publishing…' : 'Publish'}</button>
            <button type="button" onClick={onDiscardDraft} disabled={busy !== null}>Discard Draft</button>
            <button type="button" onClick={onSignOut}>Log out</button>
          </div>
        </header>
        <nav className="editor-tabs" aria-label="Editor sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <main className="editor-body">
          <TabErrorBoundary>
            {tab === 'profile' && <ProfileForm />}
            {tab === 'contact' && <ContactForm />}
            {tab === 'skills' && <SkillsForm />}
            {tab === 'projects' && <ProjectsForm />}
            {tab === 'creative' && <CreativeForm />}
            {tab === 'education' && <EducationForm />}
            {tab === 'sections' && <SectionsForm />}
          </TabErrorBoundary>
        </main>
      </div>
    </EditorContext.Provider>
  );
}