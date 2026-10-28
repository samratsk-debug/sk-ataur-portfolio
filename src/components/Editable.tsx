import type { FocusEvent } from 'react';

interface EditableProps {
  value: string;
  path: string;
  editable: boolean;
  onChange?: (path: string, value: string) => void;
  className?: string;
  as?: string;
}

export function Editable({ value, path, editable, onChange, className, as }: EditableProps) {
  const Tag: any = as ?? 'span';
  return (
    <Tag
      className={className}
      contentEditable={editable || undefined}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={
        editable && onChange
          ? (e: FocusEvent<HTMLElement>) => onChange(path, e.currentTarget.innerText)
          : undefined
      }
    >
      {value}
    </Tag>
  );
}