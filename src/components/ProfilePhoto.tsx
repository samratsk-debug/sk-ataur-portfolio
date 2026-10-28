import type { ChangeEvent } from 'react';

interface ProfilePhotoProps {
  src?: string;
  name: string;
  editable: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onOpenLogin: () => void; // NEW: Trigger for public visitors
}

export function ProfilePhoto({ src, name, editable, onUpload, onRemove, onOpenLogin }: ProfilePhotoProps) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'SA';
  
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const inner = src ? <img src={src} alt={`${name} portrait`} className="profile-avatar" /> : <span className="profile-initials" aria-hidden="true">{initials}</span>;

  return (
    <div className="profile-photo">
      {!editable ? (
        <button type="button" className="profile-click-target" onClick={onOpenLogin} title="Owner Login">
          {inner}
        </button>
      ) : (
        <div className="profile-click-target">
          {inner}
          <div className="profile-edit">
            <label className="profile-btn">{src ? 'Change' : 'Add'}<input type="file" accept="image/*" onChange={handleFile} hidden /></label>
            {src && <button type="button" className="profile-btn danger" onClick={onRemove}>Remove</button>}
          </div>
        </div>
      )}
    </div>
  );
}