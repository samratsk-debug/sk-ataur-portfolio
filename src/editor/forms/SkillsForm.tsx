import { useEditor } from '../EditorContext';
import type { Skill } from '../../types';

function uid() { return 'sk-' + Math.random().toString(36).slice(2, 9); }

export function SkillsForm() {
  const { draft, setDraft, toast } = useEditor();

  const update = (id: string, patch: Partial<Skill>) =>
    setDraft((d) => ({ ...d, skills: d.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));

  const remove = (id: string) => {
    if (!confirm('Delete this skill? It will be removed from all projects.')) return;
    setDraft((d) => ({
      ...d,
      skills: d.skills.filter((s) => s.id !== id),
      projects: d.projects.map((p) => ({ ...p, skillIds: p.skillIds.filter((sid) => sid !== id) })),
    }));
    toast('Skill removed', 'ok');
  };

  const add = () => setDraft((d) => ({ ...d, skills: [...d.skills, { id: uid(), name: 'New skill', desc: '' }] }));

  const move = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const list = [...d.skills];
      const i = list.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return d;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...d, skills: list };
    });
  };

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h2>Skills</h2>
      <button type="button" className="primary" onClick={add}>+ Add skill</button>
      <div className="rows">
        {draft.skills.map((s, i) => (
          <div className="row-card" key={s.id}>
            <div className="row-handle">
              <button type="button" onClick={() => move(s.id, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(s.id, 1)} disabled={i === draft.skills.length - 1} aria-label="Move down">↓</button>
            </div>
            <div className="row-fields">
              <label>Name<input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} /></label>
              <label>Description<textarea rows={2} value={s.desc} onChange={(e) => update(s.id, { desc: e.target.value })} /></label>
            </div>
            <button type="button" className="danger" onClick={() => remove(s.id)}>Delete</button>
          </div>
        ))}
      </div>
    </form>
  );
}