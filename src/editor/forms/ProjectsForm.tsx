import { useEditor } from '../EditorContext';
import { AssetUploader } from '../AssetUploader';
import type { Project } from '../../types';

function uid() { return 'pr-' + Math.random().toString(36).slice(2, 9); }
function skillUid() { return 'sk-' + Math.random().toString(36).slice(2, 9); }

export function ProjectsForm() {
  const { draft, setDraft, toast } = useEditor();
  
  const update = (id: string, patch: Partial<Project>) => 
    setDraft((d) => ({ ...d, projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
  
  const toggleSkill = (pid: string, sid: string) => 
    setDraft((d) => ({
      ...d,
      projects: d.projects.map((p) => {
        if (p.id !== pid) return p;
        const set = new Set(p.skillIds || []);
        if (set.has(sid)) set.delete(sid); else set.add(sid);
        return { ...p, skillIds: [...set] };
      }),
    }));

  const createSkill = () => {
    const name = prompt("New skill name:");
    if (!name) return;
    const newSkill = { id: skillUid(), name, desc: '' };
    setDraft((d) => ({ ...d, skills: [...d.skills, newSkill] }));
    toast('Skill created', 'ok');
  };

  const add = () => setDraft((d) => ({ 
    ...d, 
    projects: [...d.projects, { id: uid(), title: 'New', date: '', text: '', fullText: '', category: '', skillIds: [], repoUrl: '', demoUrl: '', thumb: null }] 
  }));
  
  const remove = (id: string) => { 
    if (!confirm('Delete?')) return; 
    setDraft((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id) })); 
    toast('Removed', 'ok'); 
  };
  
  const move = (id: string, dir: -1 | 1) => setDraft((d) => { 
    const list = [...d.projects]; 
    const i = list.findIndex((p) => p.id === id); 
    const j = i + dir; 
    if (i < 0 || j < 0 || j >= list.length) return d; 
    [list[i], list[j]] = [list[j], list[i]]; 
    return { ...d, projects: list }; 
  });

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Projects</h2>
        <button type="button" className="primary" onClick={add}>+ Add project</button>
      </div>
      <div className="rows">
        {draft.projects.map((p, i) => (
          <div className="row-card" key={p.id}>
            <div className="row-handle">
              <button type="button" onClick={() => move(p.id, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(p.id, 1)} disabled={i === draft.projects.length - 1}>↓</button>
            </div>
            <div className="row-fields">
              <label>Title<input value={p.title} onChange={(e) => update(p.id, { title: e.target.value })} /></label>
              <div className="inline">
                <label>Date<input value={p.date} onChange={(e) => update(p.id, { date: e.target.value })} /></label>
                <label>Category<input value={p.category} onChange={(e) => update(p.id, { category: e.target.value })} /></label>
              </div>
              <label>Short Description (Card view)<textarea rows={2} value={p.text} onChange={(e) => update(p.id, { text: e.target.value })} /></label>
              <label>Full Description (Expanded view)<textarea rows={4} value={p.fullText} onChange={(e) => update(p.id, { fullText: e.target.value })} /></label>
              <div className="inline">
                <label>Repo URL<input type="url" value={p.repoUrl} onChange={(e) => update(p.id, { repoUrl: e.target.value })} /></label>
                <label>Demo URL<input type="url" value={p.demoUrl} onChange={(e) => update(p.id, { demoUrl: e.target.value })} /></label>
              </div>
              
              <fieldset>
                <legend style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span>Skills Used</span>
                  <button type="button" className="primary" style={{ padding: '2px 8px', fontSize: 11 }} onClick={createSkill}>+ New</button>
                </legend>
                {/* Changed grid to auto-fill for better responsiveness */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px 16px', marginTop: 12 }}>
                  {draft.skills.map((s) => (
                    <label key={s.id} className="check">
                      <input type="checkbox" checked={(p.skillIds || []).includes(s.id)} onChange={() => toggleSkill(p.id, s.id)} />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              
              <h4>Thumbnail</h4>
              <AssetUploader aspect={16/9} value={p.thumb} onChange={(a) => update(p.id, { thumb: a })} />
            </div>
            <button type="button" className="danger" onClick={() => remove(p.id)}>Delete</button>
          </div>
        ))}
      </div>
    </form>
  );
}