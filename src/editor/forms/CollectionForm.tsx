import { useEditor } from '../EditorContext';
import { AssetUploader } from '../AssetUploader';
import type { SectionItem } from '../../types';

function uid() { return 'item-' + Math.random().toString(36).slice(2, 9); }

export function CollectionForm({ sectionId, items }: { sectionId: string; items: SectionItem[] }) {
  const { draft, setDraft, toast } = useEditor();

  const update = (id: string, patch: Partial<SectionItem>) => {
    setDraft((d) => ({
      ...d,
      customSections: d.customSections.map(cs => {
        if (cs.id !== sectionId) return cs;
        return { ...cs, items: cs.items.map(item => item.id === id ? { ...item, ...patch } : item) };
      })
    }));
  };

  const add = () => {
    setDraft((d) => ({
      ...d,
      customSections: d.customSections.map(cs => {
        if (cs.id !== sectionId) return cs;
        return { ...cs, items: [...cs.items, { id: uid(), title: 'New Item', text: '', fullText: '', date: '', skills: [], img: '' }] };
      })
    }));
  };

  const remove = (id: string) => {
    if (!confirm('Delete this item?')) return;
    setDraft((d) => ({
      ...d,
      customSections: d.customSections.map(cs => {
        if (cs.id !== sectionId) return cs;
        return { ...cs, items: cs.items.filter(item => item.id !== id) };
      })
    }));
    toast('Item removed', 'ok');
  };

  const move = (id: string, dir: -1 | 1) => {
    setDraft((d) => ({
      ...d,
      customSections: d.customSections.map(cs => {
        if (cs.id !== sectionId) return cs;
        const list = [...cs.items];
        const i = list.findIndex(item => item.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return cs;
        [list[i], list[j]] = [list[j], list[i]];
        return { ...cs, items: list };
      })
    }));
  };

  return (
    <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Collection Items</h3>
        <button type="button" className="primary" onClick={add}>+ Add Item</button>
      </div>
      
      <div className="rows">
        {items.map((item, i) => (
          <div className="row-card" key={item.id}>
            <div className="row-handle">
              <button type="button" onClick={() => move(item.id, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(item.id, 1)} disabled={i === items.length - 1}>↓</button>
            </div>
            <div className="row-fields">
              <div className="inline">
                <label>Title<input value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} /></label>
                <label>Date<input value={item.date} onChange={(e) => update(item.id, { date: e.target.value })} /></label>
              </div>
              <label>Short Description (Card view)<textarea rows={2} value={item.text} onChange={(e) => update(item.id, { text: e.target.value })} /></label>
              <label>Full Description (Expanded view)<textarea rows={3} value={item.fullText || ''} onChange={(e) => update(item.id, { fullText: e.target.value })} /></label>
              <label>Link URL<input type="url" value={item.externalUrl || ''} onChange={(e) => update(item.id, { externalUrl: e.target.value })} /></label>
              
              <fieldset>
                <legend>Skills</legend>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {draft.skills.map(s => (
                    <label key={s.id} className="check">
                      <input 
                        type="checkbox" 
                        checked={(item.skills || []).includes(s.name)} 
                        onChange={(e) => {
                          const current = item.skills || [];
                          const next = e.target.checked ? [...current, s.name] : current.filter(n => n !== s.name);
                          update(item.id, { skills: next });
                        }} 
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <h4>Thumbnail</h4>
              <AssetUploader 
                aspect={16/9} 
                value={item.img ? { assetId: '', path: item.img, bucket: 'portfolio-assets', url: item.img } : null} 
                onChange={(a) => update(item.id, { img: a?.url || '' })} 
              />
            </div>
            <button type="button" className="danger" onClick={() => remove(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}