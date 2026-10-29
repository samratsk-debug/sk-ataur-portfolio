import { useRef, useState } from 'react';
import type { AssetRef } from '../types';
import { useEditor } from './EditorContext';
import { ImageCropper } from './ImageCropper';

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
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast('Must be an image.', 'err'); return; }
    if (file.size > 4 * 1024 * 1024) { toast('Image > 4MB.', 'err'); return; }
    
    // Open the cropper instead of uploading immediately
    const url = URL.createObjectURL(file);
    setImageToCrop(url);
  };

  const handleCropComplete = async (blob: Blob) => {
    setImageToCrop(null);
    setBusy(true);
    setProgress(30);
    try {
      const file = new File([blob], 'upload.jpg', { type: 'image/jpeg' });
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
    if (!value || !confirm(`Remove ${label.toLowerCase()}?`)) return;
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
        {value && <button type="button" onClick={remove} disabled={busy}>Remove</button>}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={handleFileSelect}
        />
      </div>
      {progress > 0 && <div className="uploader-bar"><span style={{ width: `${progress}%` }} /></div>}

      {/* Render the cropper modal if an image is selected */}
      {imageToCrop && (
        <ImageCropper 
          image={imageToCrop} 
          aspect={aspect || 1}
          cropShape={aspect && aspect !== 1 ? 'rect' : 'round'} 
          onCancel={() => setImageToCrop(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}
    </div>
  );
}