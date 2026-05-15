import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fuzzyFilter, type FuzzyMatch } from '../lib/fuzzy';
import { basename } from '../lib/paths';
import { languageFor } from '../lib/languages';

type Props = {
  open: boolean;
  rootPath: string | null;
  files: string[];
  onClose: () => void;
  onPick: (path: string, name: string) => void;
};

const MAX_RESULTS = 50;

export function QuickOpen({ open, rootPath, files, onClose, onPick }: Props) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const relative = useMemo(() => {
    if (!rootPath) return files;
    const prefix = rootPath.endsWith('\\') || rootPath.endsWith('/') ? rootPath : rootPath + (rootPath.includes('\\') ? '\\' : '/');
    return files.map((f) => (f.startsWith(prefix) ? f.slice(prefix.length) : f));
  }, [files, rootPath]);

  const results = useMemo<FuzzyMatch[]>(
    () => fuzzyFilter(query, relative, MAX_RESULTS),
    [query, relative]
  );

  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, results.length - 1)));
  }, [results.length]);

  const pick = (rel: string): void => {
    const idx = relative.indexOf(rel);
    if (idx === -1) return;
    const abs = files[idx];
    onPick(abs, basename(abs));
    onClose();
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[cursor];
      if (hit) pick(hit.value);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="qo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 pt-[15vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -8, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="w-[520px] max-w-[88vw] overflow-hidden rounded-lg border border-border bg-panel shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder={files.length === 0 ? 'Indexing files…' : 'Search files'}
              className="w-full bg-transparent px-4 py-3 text-sm text-fg outline-none placeholder:text-muted"
            />
            <div className="max-h-[50vh] overflow-y-auto border-t border-border">
              {results.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted">
                  {files.length === 0 ? 'Indexing…' : 'No matches'}
                </div>
              ) : (
                results.map((m, i) => (
                  <Row
                    key={m.value}
                    match={m}
                    active={i === cursor}
                    onPick={() => pick(m.value)}
                    onHover={() => setCursor(i)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type RowProps = {
  match: FuzzyMatch;
  active: boolean;
  onPick: () => void;
  onHover: () => void;
};

function Row({ match, active, onPick, onHover }: RowProps) {
  const name = basename(match.value);
  const dir = match.value.slice(0, match.value.length - name.length).replace(/[\\/]+$/, '');
  const lang = languageFor(name);

  return (
    <button
      onClick={onPick}
      onMouseEnter={onHover}
      className={`flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs transition-colors ${
        active ? 'bg-elevated text-fg' : 'text-fg/80 hover:bg-elevated/60'
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: lang.color }} />
      <Highlighted text={match.value} positions={match.positions} nameLen={name.length} />
      {dir && <span className="ml-auto truncate text-[10px] text-muted">{dir}</span>}
    </button>
  );
}

function Highlighted({
  text,
  positions,
  nameLen
}: {
  text: string;
  positions: number[];
  nameLen: number;
}) {
  const nameStart = text.length - nameLen;
  const set = new Set(positions);
  const chars = text.split('').slice(nameStart);
  return (
    <span className="truncate">
      {chars.map((c, i) => {
        const abs = nameStart + i;
        return set.has(abs) ? (
          <span key={i} className="text-accent">
            {c}
          </span>
        ) : (
          <span key={i}>{c}</span>
        );
      })}
    </span>
  );
}
