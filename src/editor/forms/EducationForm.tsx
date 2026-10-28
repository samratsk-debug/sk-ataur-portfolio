import { useEditor } from '../EditorContext';
import type { EducationEntry } from '../../types';

function uid() { return 'ed-' + Math.random().toString(36).slice(2, 9); }

export function EducationForm() {
  const { draft, setDraft, toast } = useEditor();

  const update = (id: string, patch: Partial<EducationEntry>) =>
    setDraft((d) => ({ ...d, education: d.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  const add = () =>
    setDraft((d) => ({
      ...d,
      education: [...d.education, { id: uid(), title: 'New qualification',
        institution: '', course: '', date: '', grade: '', text: '' }],
    }));

  const remove = (id: string) => {
    if (!confirm('Delete this qualification?')) return;
    setDraft((d) => ({ ...d, education: d.education.filter((e) => e.id !== id) }));
    toast('Qualification removed', 'ok');
  };

  const move = (id: string, dir: -1 | 1) =>
    setDraft((d) => {
      const list = [...d.education];
      const i = list.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return d;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...d, education: list };
    });

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h2>Education</h2>
      <button type="button" className="primary" onClick={add}>+ Add qualification</button>
      <div className="rows">
        {draft.education.map((e, i) => (
          <div className="row-card" key={e.id}>
            <div className="row-handle">
              <button type="button" onClick={() => move(e.id, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(e.id, 1)} disabled={i === draft.education.length - 1} aria-label="Move down">↓</button>
            </div>
            <div className="row-fields">
              <label>Qualification<input value={e.title} onChange={(ev) => update(e.id, { title: ev.target.value })} /></label>
              <label>Institution<input value={e.institution} onChange={(ev) => update(e.id, { institution: ev.target.value })} /></label>
              <label>Course / details<input value={e.course} onChange={(ev) => update(e.id, { course: ev.target.value })} /></label>
              <div className="inline">
                <label>Dates<input value={e.date} onChange={(ev) => update(e.id, { date: ev.target.value })} /></label>
                <label>Grade / CGPA<input value={e.grade} onChange={(ev) => update(e.id, { grade: ev.target.value })} /></label>
              </div>
              <label>Description<textarea rows={2} value={e.text} onChange={(ev) => update(e.id, { text: ev.target.value })} /></label>
            </div>
            <button type="button" className="danger" onClick={() => remove(e.id)}>Delete</button>
          </div>
        ))}
      </div>
    </form>
  );
}