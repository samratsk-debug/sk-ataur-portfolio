import { useRef, useState } from 'react';
import { useEditor } from './EditorContext';
import { ImageCropper } from './ImageCropper';
import { normalizeExternalUrl } from '../utils/url';

export function ProfilePhotoEditor() {
  const { draft, setDraft, uploadAsset, toast, deleteAsset } = useEditor();
  const profile = draft.profile;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Must be an image.', 'err');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast('Image > 4MB.', 'err');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setImageToCrop(url);
  };

  const handleCropComplete = async (blob: Blob) => {
    setBusy(true);
    setImageToCrop(null);
    try {
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      const asset = await uploadAsset(file, 'draft');
      
      const oldPath = profile.photo?.path;
      setDraft((d) => ({ ...d, profile: { ...d.profile, photo: asset } }));
      
      if (oldPath && oldPath !== asset.path) {
        await deleteAsset(oldPath).catch(() => console.warn('Old photo cleanup failed'));
      }
      toast('Photo cropped successfully. Save Changes to persist.', 'ok');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'err');
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = () => {
    if (!confirm('Remove profile photo?')) return;
    const oldPath = profile.photo?.path;
    setDraft((d) => ({ ...d, profile: { ...d.profile, photo: null } }));
    if (oldPath) deleteAsset(oldPath).catch(() => {});
    toast('Photo removed.', 'ok');
  };

  return (
    <div className="profile-photo-editor">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fff', background: 'rgba(255,255,255,0.1)' }}>
            {profile.photo?.url ? (
              <img src={profile.photo.url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 32, color: '#fff' }}>?</div>
            )}
          </div>
          
          <button 
            type="button" 
            className="button" 
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,.2)', fontSize: 13, background: 'transparent', color: '#fff' }}
          >
            {profile.photo ? 'Replace Photo' : 'Upload Photo'}
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            hidden 
            onChange={handleFileSelect} 
          />

          {profile.photo && (
            <button type="button" className="danger" style={{ width: '100%' }} onClick={removePhoto}>Remove</button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 200 }}>
          <p className="muted" style={{ margin: 0 }}>Crop and adjust your profile picture before saving. The cropper will appear automatically when you upload.</p>
          <button 
            type="button" 
            className="primary" 
            disabled={!profile.photo || busy}
            onClick={() => setShowResumePreview(true)}
            style={{ alignSelf: 'flex-start' }}
          >
            Preview on Resume
          </button>
        </div>
      </div>

      {imageToCrop && (
        <ImageCropper 
          image={imageToCrop} 
          onCancel={() => setImageToCrop(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}

      {showResumePreview && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }} onClick={(e) => { if (e.target === e.currentTarget) setShowResumePreview(false); }}>
          <div className="modal-content glass-panel" style={{ width: 'min(800px, 100%)', padding: 32 }}>
            <button type="button" className="modal-close" onClick={() => setShowResumePreview(false)}>×</button>
            <h3 style={{ margin: '0 0 24px', color: '#fff' }}>Resume Preview</h3>
            
            <div style={{ background: 'var(--paper)', padding: '40px', borderRadius: '8px', color: 'var(--ink)' }}>
              <header className="paper-head identity-header">
                <div className="profile-photo">
                  <div className="profile-click-target">
                    {profile.photo?.url ? <img src={profile.photo.url} className="profile-avatar" /> : <span className="profile-initials">SA</span>}
                  </div>
                </div>
                <div className="head-text">
                  <div className="kick">CURRICULUM VITAE</div>
                  <h1 className="name">{profile.name}</h1>
                  <p className="role">{profile.role}</p>
                  <p className="ct">{profile.contacts?.map(c => c.value).slice(0, 3).filter(Boolean).join(' · ')}</p>
                  
                  {profile.socialLinks && profile.socialLinks.length > 0 && (
                    <div className="social-links">
                      {profile.socialLinks.map((link) => {
                        const url = normalizeExternalUrl(link.url);
                        if (!url) return null;
                        return (
                          <a key={link.id} href={url} target="_blank" rel="noopener noreferrer">
                            {link.label} ↗
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </header>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="primary" onClick={() => setShowResumePreview(false)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}