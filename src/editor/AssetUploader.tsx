import { useRef, useState } from 'react';
import type { AssetRef } from '../types';
import { useEditor } from './EditorContext';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

interface Props {
  value: AssetRef | null;
  onChange: (a: AssetRef | null) => void;
  label?: string;
  aspect?: number;
}

export function AssetUploader({ value, onChange, label = 'Image', aspect }: Props) {
  const { uploadAsset, deleteAsset, toast } = useEditor();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('File must be an image.', 'err');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast('Image is larger than 4 MB.', 'err');
      return;
    }
    
    setBusy(true);
    setProgress(30);
    try {
      const asset = await uploadAsset(file, 'draft');
      onChange(asset);
      setProgress(100);
      toast(`${label} uploaded.`, 'ok');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed.', 'err');
      setProgress(0);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 700);
    }
  };

  const remove = async () => {
    if (!value) return;
    if (!confirm(`Remove ${label.toLowerCase()}?`)) return;
    
    // Drop the reference first so a failed storage delete never blocks the user.
    const oldPath = value.path;
    onChange(null);
    try { await deleteAsset(oldPath); } catch { /* logged by repository */ }
  };

  return (
    <div className="uploader">
      <div className="uploader-preview" style={aspect ? { aspectRatio: String(aspect) } : undefined}>
        {value?.url ? (
          <img src={value.url} alt="" />
        ) : (
          <span className="muted">No {label.toLowerCase()}</span>
        )}
      </div>
      <div className="uploader-actions">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>
          {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button type="button" onClick={remove} disabled={busy}>
            Remove
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void handleFile(f);
          }}
        />
      </div>
      {progress > 0 && (
        <div className="uploader-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}