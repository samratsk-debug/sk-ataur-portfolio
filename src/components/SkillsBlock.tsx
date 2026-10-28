import type { SkillChip } from '../types';
import { Editable } from './Editable';

interface SkillsBlockProps {
  chips: SkillChip[];
  path: string;
  editing: boolean;
  selected: number;
  onSelect: (index: number) => void;
  countFor: (name: string) => number;
  onViewRelated: (name: string) => void;
  onText: (path: string, value: string) => void;
  onAdd: () => void;
  onRemove: (path: string) => void;
}

export function SkillsBlock({
  chips, path, editing, selected, onSelect, countFor, onViewRelated, onText, onAdd, onRemove,
}: SkillsBlockProps) {
  return (
    <>
      <div className="chips">
        {chips.map((c, j) =>
          editing ? (
            <span key={j} className="chip">
              <Editable value={c.name} path={`${path}.chips.${j}.name`} editable onChange={onText} />
              <button type="button" className="x" aria-label={`Remove ${c.name}`} onClick={() => onRemove(`${path}.chips.${j}`)}>
                ×
              </button>
            </span>
          ) : (
            <button
              key={j}
              type="button"
              className="chip pick"
              aria-pressed={selected === j}
              onClick={() => onSelect(j)}
            >
              {c.name}
            </button>
          )
        )}
        {editing && (
          <button type="button" className="add" onClick={onAdd}>
            + Add skill
          </button>
        )}
      </div>

      {!editing && (
        <p className="hint">Select a skill to read about it and jump to matching work.</p>
      )}

      <div className="skps">
        {chips.map((c, j) => {
          const count = countFor(c.name);
          return (
            <div key={j} className={`skp${selected === j ? ' on' : ''}`} data-p={j}>
              {editing && <small>{c.name}</small>}
              <p>
                <Editable value={c.desc} path={`${path}.chips.${j}.desc`} editable={editing} onChange={onText} />
              </p>
              {!editing &&
                (count ? (
                  <button type="button" className="lnk" onClick={() => onViewRelated(c.name)}>
                    View {count} related item{count > 1 ? 's' : ''} →
                  </button>
                ) : (
                  <span className="sm">Nothing linked yet</span>
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
}