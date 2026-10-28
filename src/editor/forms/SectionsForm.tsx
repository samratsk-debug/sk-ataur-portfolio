import { useState } from 'react';
import { useEditor } from '../EditorContext';
import { CollectionForm } from './CollectionForm';
import type { CustomSection } from '../../types';

export function SectionsForm() {
  const { draft, setDraft, toast } = useEditor();
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'informational' | 'collection'>('informational');

  const order = draft.sectionOrder || ['about', 'skills', 'projects', 'creative', 'education', 'contact'];
  const customSections = draft.customSections || [];

  const move = (index: number, dir: -1 | 1) => {
    setDraft((d) => {
      const currentOrder = d.sectionOrder || [];
      const newOrder = [...currentOrder];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= newOrder.length) return d;
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      return { ...d, sectionOrder: newOrder };
    });
  };

  const addSection = () => {
    if (!newTitle.trim()) { toast('Title is required', 'err'); return; }
    const newId = 'custom-' + Date.now();
    const newSection: CustomSection = {
      id: newId,
      title: newTitle,
      summary: 'Click to edit',
      type: newType,
      content: newType === 'informational' ? 'Write your content here...' : '',
      items: []
    };
    setDraft((d) => ({
      ...d,
      sectionOrder: [...(d.sectionOrder || order), newId],
      customSections: [...(d.customSections || []), newSection]
    }));
    setNewTitle('');
    toast('Section created', 'ok');
  };

  const updateCustom = (id: string, patch: Partial<CustomSection>) => {
    setDraft((d) => ({
      ...d,
      customSections: (d.customSections || []).map(c => c.id === id ? { ...c, ...patch } : c)
    }));
  };

  const removeSection = (id: string) => {
    if (!confirm('Delete this section? (This will not delete built-in data like Projects, but will hide them)')) return;
    setDraft((d) => ({
      ...d,
      sectionOrder: (d.sectionOrder || []).filter(sid => sid !== id),
      customSections: (d.customSections || []).filter(c => c.id !== id)
    }));
    toast('Section removed', 'ok');
  };

  const restoreDefaults = () => {
    if (!confirm('Reset order to include all default sections?')) return;
    setDraft(d => ({
      ...d,
      sectionOrder: ['about', 'skills', 'projects', 'creative', 'education', 'contact', ...(d.customSections || []).map(c => c.id)]
    }));
  };

  return (
    <div className="form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Page Sections</h2>
        <button type="button" onClick={restoreDefaults}>Restore Defaults</button>
      </div>

      <div style={{ padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Create New Section</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 200 }}>Section Title
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Certifications" />
          </label>
          <label style={{ width: 220 }}>Type
            <select 
              className="custom-select"
              value={newType} 
              onChange={(e) => setNewType(e.target.value as any)}
            >
              <option value="informational">Informational (Text)</option>
              <option value="collection">Collection (Cards)</option>
            </select>
          </label>
          <button type="button" className="primary" onClick={addSection}>Create Section</button>
        </div>
      </div>
      
      <div className="rows">
        {order.map((id, index) => {
          const isCustom = id.startsWith('custom-');
          const customData = isCustom ? customSections.find(c => c.id === id) : null;
          
          const defaultNames: Record<string, string> = { about: 'About', skills: 'Skills', projects: 'Projects & Experience', creative: 'Creative Work', education: 'Education', contact: 'Contact' };
          const title = customData ? customData.title : defaultNames[id] || id;

          return (
            <div className="section-manager-card" key={id}>
              <div className="section-manager-reorder">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1}>↓</button>
              </div>
              
              <div className="section-manager-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <strong>{title} {customData && `(${customData.type})`}</strong>
                  {!isCustom && <span className="muted" style={{ fontSize: 12, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>Built-in</span>}
                </div>
                
                {customData && customData.type === 'informational' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label>Summary<input value={customData.summary} onChange={(e) => updateCustom(id, { summary: e.target.value })} /></label>
                    <label>Content<textarea rows={4} value={customData.content} onChange={(e) => updateCustom(id, { content: e.target.value })} /></label>
                  </div>
                )}
                {customData && customData.type === 'collection' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label>Summary<input value={customData.summary} onChange={(e) => updateCustom(id, { summary: e.target.value })} /></label>
                    <CollectionForm sectionId={id} items={customData.items} />
                  </div>
                )}
                {!customData && <span className="muted">Managed in the {title} tab above.</span>}
              </div>

              <div className="section-manager-actions">
                <button type="button" className="danger section-manager-delete" onClick={() => removeSection(id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}