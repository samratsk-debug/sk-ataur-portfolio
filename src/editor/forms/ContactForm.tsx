import { useEditor } from '../EditorContext';
import type { ContactEntry, ContactType } from '../../types';

export function ContactForm() {
  const { draft, setDraft, toast } = useEditor();
  const contacts = draft.profile.contacts || [];

  const update = (id: string, patch: Partial<ContactEntry>) => {
    setDraft((d) => ({
      ...d,
      profile: {
        ...d.profile,
        contacts: d.profile.contacts.map(c => c.id === id ? { ...c, ...patch } : c)
      }
    }));
  };

  const add = () => {
    const newEntry: ContactEntry = {
      id: 'c-' + Date.now(),
      label: 'New Detail',
      type: 'text',
      value: ''
    };
    setDraft((d) => ({
      ...d,
      profile: { ...d.profile, contacts: [...(d.profile.contacts || []), newEntry] }
    }));
  };

  const remove = (id: string) => {
    if (!confirm('Delete this contact detail?')) return;
    setDraft((d) => ({
      ...d,
      profile: { ...d.profile, contacts: d.profile.contacts.filter(c => c.id !== id) }
    }));
    toast('Contact removed', 'ok');
  };

  const move = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const list = [...(d.profile.contacts || [])];
      const i = list.findIndex(c => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return d;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...d, profile: { ...d.profile, contacts: list } };
    });
  };

  return (
    <div className="form">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Contact Details</h2>
        <button type="button" className="primary" onClick={add}>+ Add Contact Detail</button>
      </div>

      {contacts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p className="muted">No contact details added yet.</p>
          <button type="button" className="primary" onClick={add} style={{ marginTop: 12 }}>Add Your First Detail</button>
        </div>
      )}

      <div className="rows">
        {contacts.map((c, i) => (
          <div className="row-card" key={c.id} style={{ gridTemplateColumns: '40px 1fr auto' }}>
            <div className="row-handle">
              <button type="button" onClick={() => move(c.id, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(c.id, 1)} disabled={i === contacts.length - 1}>↓</button>
            </div>
            
            <div className="row-fields">
              <div className="inline">
                <label>Label
                  <input value={c.label} onChange={(e) => update(c.id, { label: e.target.value })} placeholder="e.g. Personal Email" />
                </label>
                <label>Type
                  <select 
                    className="custom-select"
                    value={c.type} 
                    onChange={(e) => update(c.id, { type: e.target.value as ContactType })}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="website">Website / URL</option>
                    <option value="text">Custom Text</option>
                  </select>
                </label>
              </div>
              <label>Value
                <input 
                  value={c.value} 
                  onChange={(e) => update(c.id, { value: e.target.value })} 
                  placeholder={c.type === 'email' ? 'you@example.com' : c.type === 'phone' ? '+1...' : 'Enter value...'}
                />
              </label>
            </div>
            
            <button type="button" className="danger" onClick={() => remove(c.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}