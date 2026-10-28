import { useEditor } from '../EditorContext';
import { AssetUploader } from '../AssetUploader';
import type { CreativePiece } from '../../types';

function uid() { return 'cr-' + Math.random().toString(36).slice(2, 9); }

export function CreativeForm() {
  const { draft, setDraft, toast } = useEditor();
  const update = (id: string, patch: Partial<CreativePiece>) => setDraft((d) => ({ ...d, creative: d.creative.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const add = () => setDraft((d) => ({ ...d, creative: [...d.creative, { id: uid(), title: 'New', kind: 'Photo', caption: '', text: '', fullText: '', image: null, externalUrl: '' }] }));
  const remove = (id: string) => { if (!confirm('Delete?')) return; setDraft((d) => ({ ...d, creative: d.creative.filter((c) => c.id !== id) })); toast('Removed', 'ok'); };
  const move = (id: string, dir: -1 | 1) => setDraft((d) => { const list = [...d.creative]; const i = list.findIndex((c) => c.id === id); const j = i + dir; if (i < 0 || j < 0 || j >= list.length) return d; [list[i], list[j]] = [list[j], list[i]]; return { ...d, creative: list }; });

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h2>Creative</h2><button type="button" className="primary" onClick={add}>+ Add piece</button>
      <div className="rows">
        {draft.creative.map((c, i) => (
          <div className="row-card" key={c.id}>
            <div className="row-handle"><button type="button" onClick={() => move(c.id, -1)} disabled={i === 0}>↑</button><button type="button" onClick={() => move(c.id, 1)} disabled={i === draft.creative.length - 1}>↓</button></div>
            <div className="row-fields">
              <div className="inline"><label>Title<input value={c.title} onChange={(e) => update(c.id, { title: e.target.value })} /></label><label>Kind<input value={c.kind} onChange={(e) => update(c.id, { kind: e.target.value })} /></label></div>
              <label>Caption<input value={c.caption} onChange={(e) => update(c.id, { caption: e.target.value })} /></label>
              <label>Short Description (Card view)<textarea rows={2} value={c.text} onChange={(e) => update(c.id, { text: e.target.value })} /></label>
              <label>Full Description (Expanded view)<textarea rows={4} value={c.fullText} onChange={(e) => update(c.id, { fullText: e.target.value })} /></label>
              <label>External URL<input type="url" value={c.externalUrl} onChange={(e) => update(c.id, { externalUrl: e.target.value })} /></label>
              <h4>Image</h4><AssetUploader aspect={16/9} value={c.image} onChange={(a) => update(c.id, { image: a })} />
            </div>
            <button type="button" className="danger" onClick={() => remove(c.id)}>Delete</button>
          </div>
        ))}
      </div>
    </form>
  );
}