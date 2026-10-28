import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css'; // REQUIRED FOR CROPPER TO WORK PROPERLY
import { getCroppedImg } from '../utils/cropImage';

interface ImageCropperProps {
  image: string;
  onCancel: () => void;
  onCropComplete: (blob: Blob) => void;
}

export function ImageCropper({ image, onCancel, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const onCropChange = (crop: { x: number; y: number }) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);
  
  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels, rotation, { horizontal: flipped, vertical: false });
      onCropComplete(blob);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipped(false);
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal-content glass-panel" style={{ width: 'min(600px, 100%)', padding: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 16px', color: '#fff' }}>Crop Profile Photo</h2>
        
        <div style={{ position: 'relative', flex: 1, minHeight: 300, background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteInternal}
            onZoomChange={onZoomChange}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 50, fontSize: 13 }}>Zoom</span>
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} style={{ flex: 1 }} />
          </div>
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setRotation((r) => (r + 90) % 360)}>Rotate +90°</button>
            <button type="button" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>Rotate -90°</button>
            <button type="button" onClick={() => setFlipped(!flipped)}>Flip Horizontal</button>
            <button type="button" onClick={reset}>Reset</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="primary" onClick={handleApply} disabled={busy}>{busy ? 'Applying...' : 'Apply Crop'}</button>
        </div>
      </div>
    </div>
  );
}