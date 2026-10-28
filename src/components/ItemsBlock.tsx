import type { SectionItem } from '../types';
import { Editable } from './Editable';

interface ItemsBlockProps {
  items: SectionItem[];
  path: string;
  editing: boolean;
  onText: (path: string, value: string) => void;
  onAdd: () => void;
  onRemove: (path: string) => void;
}

export function ItemsBlock({ items, path, editing, onText, onAdd, onRemove }: ItemsBlockProps) {
  return (
    <div className="items">
      {items.map((t, j) => {
        const itemPath = `${path}.items.${j}`;
        return (
          <div className="it" key={j}>
            <div className="ih">
              <b>
                <Editable value={t.title} path={`${itemPath}.title`} editable={editing} onChange={onText} />
              </b>
              <span className="dm">
                <Editable value={t.date} path={`${itemPath}.date`} editable={editing} onChange={onText} />
              </span>
            </div>
            <span className="itext">
              <Editable value={t.text} path={`${itemPath}.text`} editable={editing} onChange={onText} />
            </span>
            {editing && (
              <button type="button" className="x" aria-label={`Remove ${t.title}`} onClick={() => onRemove(itemPath)}>
                ×
              </button>
            )}
          </div>
        );
      })}
      {editing && (
        <button type="button" className="add" onClick={onAdd}>
          + Add entry
        </button>
      )}
    </div>
  );
}