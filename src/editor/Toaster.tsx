import { useCallback, useRef, useState } from 'react';

export interface ToastItem {
  id: number;
  msg: string;
  type: 'ok' | 'err';
}

export function useToasts() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return { items, push };
}

export function Toaster({ items }: { items: ToastItem[] }) {
  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}