import type { Profile } from '../types';
import { ProfilePhoto } from './ProfilePhoto';
import { normalizeExternalUrl } from '../utils/url';

export function Header({ 
  profile, editable, onUploadPhoto, onRemovePhoto, onOpenLogin 
}: { 
  profile: Profile; editable: boolean; onUploadPhoto: (f: File) => void; onRemovePhoto: () => void; onOpenLogin: () => void;
}) {
  // Find the first entry of each primary type to display in the header
  const primaryEmail = profile.contacts?.find(c => c.type === 'email')?.value;
  const primaryPhone = profile.contacts?.find(c => c.type === 'phone')?.value;
  const primaryAddress = profile.contacts?.find(c => c.type === 'address')?.value;

  return (
    <header className="paper-head identity-header">
      <ProfilePhoto 
        src={profile.photo?.url} 
        name={profile.name} 
        editable={editable} 
        onUpload={onUploadPhoto} 
        onRemove={onRemovePhoto}
        onOpenLogin={onOpenLogin}
      />
      <div className="head-text">
        <div className="kick">CURRICULUM VITAE</div>
        <h1 className="name">{profile.name}</h1>
        <p className="role">{profile.role}</p>
        <p className="ct">{[primaryEmail, primaryPhone, primaryAddress].filter(Boolean).join(' · ')}</p>
        
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
  );
}