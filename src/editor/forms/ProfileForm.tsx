import { useEditor } from '../EditorContext';
import { ProfilePhotoEditor } from '../ProfilePhotoEditor';
import { normalizeExternalUrl } from '../../utils/url';

export function ProfileForm() {
  const { draft, setDraft, toast } = useEditor();
  const p = draft.profile;

  const set = <K extends keyof typeof p>(key: K, val: (typeof p)[K]) =>
    setDraft((d) => ({ ...d, profile: { ...d.profile, [key]: val } }));

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') { toast('File must be a PDF.', 'err'); return; }
    if (file.size > 10 * 1024 * 1024) { toast('PDF is larger than 10 MB.', 'err'); return; }

    try {
      const asset = await useEditor().uploadAsset(file, 'public');
      setDraft(d => ({
        ...d,
        resume: {
          url: asset.url,
          path: asset.path,
          filename: file.name,
          size: file.size,
          updatedAt: new Date().toISOString()
        }
      }));
      toast('Resume PDF uploaded.', 'ok');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed.', 'err');
    }
  };

  return (
    <form className="form" onSubmit={(e) => e.preventDefault()}>
      <h2>Personal Details</h2>
      
      <div className="row-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>Name<input value={p.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label>Professional title<input value={p.role} onChange={(e) => set('role', e.target.value)} /></label>
        <label>About<textarea rows={6} value={p.about} onChange={(e) => set('about', e.target.value)} /></label>
      </div>

      <h3 style={{ marginTop: 24 }}>Profile Photo</h3>
      <ProfilePhotoEditor />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <h3 style={{ margin: 0 }}>Social Profiles</h3>
        <button type="button" className="primary" onClick={() => set('socialLinks', [...p.socialLinks, { id: 'social-' + Date.now(), label: 'New Link', url: '' }])}>+ Add Link</button>
      </div>
      
      {p.socialLinks.length === 0 && <p className="muted">No social links added yet.</p>}

      <div className="rows">
        {p.socialLinks.map((link, i) => {
          const isValid = !link.url || normalizeExternalUrl(link.url) !== null;
          return (
            <div className="row-card" key={link.id}>
              <div className="row-handle">
                <button type="button" onClick={() => {
                  const next = [...p.socialLinks];
                  if (i === 0) return;
                  [next[i], next[i-1]] = [next[i-1], next[i]];
                  set('socialLinks', next);
                }} disabled={i === 0}>↑</button>
                <button type="button" onClick={() => {
                  const next = [...p.socialLinks];
                  if (i === next.length - 1) return;
                  [next[i], next[i+1]] = [next[i+1], next[i]];
                  set('socialLinks', next);
                }} disabled={i === p.socialLinks.length - 1}>↓</button>
              </div>
              <div className="row-fields">
                <div className="inline">
                  <label>Label<input value={link.label} onChange={(e) => {
                    const next = [...p.socialLinks];
                    next[i].label = e.target.value;
                    set('socialLinks', next);
                  }} placeholder="e.g. GitHub" /></label>
                  <label>
                    URL
                    <input 
                      type="url" 
                      value={link.url} 
                      onChange={(e) => {
                        const next = [...p.socialLinks];
                        next[i].url = e.target.value;
                        set('socialLinks', next);
                      }} 
                      placeholder="https://..."
                      style={{ borderColor: isValid ? undefined : '#FF9B9B' }}
                    />
                    {!isValid && <span style={{ color: '#FF9B9B', fontSize: 11 }}>Invalid URL. Will not render publicly.</span>}
                  </label>
                </div>
              </div>
              <button type="button" className="danger" onClick={() => {
                if (confirm('Remove link?')) set('socialLinks', p.socialLinks.filter((_, idx) => idx !== i));
              }}>Remove</button>
            </div>
          );
        })}
      </div>

      <h3 style={{ marginTop: 32 }}>Resume PDF</h3>
      {draft.resume ? (
        <div style={{ background: 'rgba(255,255,255,.05)', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,.1)' }}>
          <p style={{ margin: '0 0 8px' }}><strong>{draft.resume.filename}</strong></p>
          <p className="muted" style={{ margin: '0 0 12px' }}>Size: {(draft.resume.size / 1024 / 1024).toFixed(2)} MB · Updated: {new Date(draft.resume.updatedAt).toLocaleDateString()}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={draft.resume.url} target="_blank" rel="noopener noreferrer" className="primary" style={{ padding: '8px 16px', textDecoration: 'none', borderRadius: 6, fontSize: 13, display: 'inline-block' }}>View Current</a>
            <label className="button" style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,.2)', fontSize: 13, background: 'transparent', color: '#fff' }}>
              Replace PDF
              <input type="file" accept="application/pdf" hidden onChange={handlePdfUpload} />
            </label>
            <button type="button" className="danger" onClick={() => { if(confirm('Remove PDF?')) setDraft(d => ({ ...d, resume: null })); }}>Remove</button>
          </div>
        </div>
      ) : (
        <label style={{ padding: 24, border: '1px dashed rgba(255,255,255,.3)', borderRadius: 8, textAlign: 'center', cursor: 'pointer', display: 'block' }}>
          <span className="muted">Click to upload your actual Resume PDF (Max 10MB)</span>
          <input type="file" accept="application/pdf" hidden onChange={handlePdfUpload} />
        </label>
      )}
    </form>
  );
}