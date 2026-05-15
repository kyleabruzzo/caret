import { useEffect, useRef } from 'react';
import { ChevronRight, FileText } from 'lucide-react';

const ROW_PAD = 8;
const DEPTH_PX = 12;

export function DraftRow({
  depth,
  kind,
  onCommit
}: {
  depth: number;
  kind: 'file' | 'folder';
  onCommit: (name: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  return (
    <div
      className="flex items-center gap-1.5 py-[3px] pr-2"
      style={{ paddingLeft: ROW_PAD + depth * DEPTH_PX }}
    >
      <span className="flex h-3 w-3 items-center justify-center text-muted">
        {kind === 'folder' ? <ChevronRight size={11} /> : <FileText size={10} />}
      </span>
      <input
        ref={ref}
        placeholder={kind === 'folder' ? 'folder' : 'file.ext'}
        onBlur={(e) => onCommit(e.currentTarget.value.trim())}
        onKeyDown={(e) => handleKey(e, '')}
        className="h-5 flex-1 rounded border border-accent/40 bg-bg px-1.5 text-xs text-fg outline-none placeholder:text-muted"
      />
    </div>
  );
}

export function RenameRow({
  depth,
  initial,
  isDir,
  onCommit
}: {
  depth: number;
  initial: string;
  isDir: boolean;
  onCommit: (name: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const dot = initial.lastIndexOf('.');
    el.setSelectionRange(0, isDir || dot <= 0 ? initial.length : dot);
  }, [initial, isDir]);

  return (
    <div
      className="flex items-center gap-1.5 py-[3px] pr-2"
      style={{ paddingLeft: ROW_PAD + depth * DEPTH_PX + 18 }}
    >
      <input
        ref={ref}
        defaultValue={initial}
        onBlur={(e) => {
          const v = e.currentTarget.value.trim();
          onCommit(v && v !== initial ? v : '');
        }}
        onKeyDown={(e) => handleKey(e, initial)}
        className="h-5 flex-1 rounded border border-accent/40 bg-bg px-1.5 text-xs text-fg outline-none"
      />
    </div>
  );
}

function handleKey(e: React.KeyboardEvent<HTMLInputElement>, escapeValue: string): void {
  if (e.key === 'Enter') {
    e.currentTarget.blur();
  } else if (e.key === 'Escape') {
    e.currentTarget.value = escapeValue;
    e.currentTarget.blur();
  }
}
