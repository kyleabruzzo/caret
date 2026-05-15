import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CaseSensitive, Regex, WholeWord, Replace } from 'lucide-react';
import { basename } from '../lib/paths';
import { languageFor } from '../lib/languages';
import type { SearchFileResult, SearchHit, SearchOptions } from '../../shared/types';

type Props = {
  rootPath: string;
  onOpenAt: (path: string, name: string, line: number, column: number) => void;
};

export function SearchPanel({ rootPath, onOpenAt }: Props) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regex, setRegex] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  const [results, setResults] = useState<SearchFileResult[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const options: SearchOptions = useMemo(
    () => ({ query, caseSensitive, regex, wholeWord }),
    [query, caseSensitive, regex, wholeWord]
  );

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      return;
    }
    const id = ++reqId.current;
    setSearching(true);
    setError(null);
    const t = window.setTimeout(async () => {
      try {
        const fn = window.caret?.fs?.searchInFiles;
        if (typeof fn !== 'function') {
          throw new Error('Search IPC not available, restart the dev server.');
        }
        const r = await fn(rootPath, options);
        if (id === reqId.current) {
          setResults(r);
          setSearching(false);
        }
      } catch (e) {
        if (id === reqId.current) {
          setError(e instanceof Error ? e.message : String(e));
          setResults([]);
          setSearching(false);
        }
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [rootPath, options, query]);

  const totalHits = useMemo(
    () => results.reduce((sum, r) => sum + r.hits.length, 0),
    [results]
  );

  const toggleCollapse = (path: string): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const replaceAll = useCallback(async () => {
    if (!query || results.length === 0) return;
    const count = await window.caret.fs.replaceInFiles(results, options, replacement);
    if (count > 0) {
      const r = await window.caret.fs.searchInFiles(rootPath, options);
      setResults(r);
    }
  }, [query, results, options, replacement, rootPath]);

  return (
    <div className="flex h-full flex-col bg-panel">
      <div className="space-y-1.5 border-b border-border px-3 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowReplace((v) => !v)}
            aria-label="Toggle replace"
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-elevated hover:text-fg ${
              showReplace ? 'text-fg' : ''
            }`}
          >
            <ChevronRight
              size={11}
              style={{ transform: showReplace ? 'rotate(90deg)' : 'rotate(0deg)' }}
              className="transition-transform duration-150"
            />
          </button>
          <div className="flex flex-1 items-center gap-1 rounded-md border border-border bg-bg px-2 focus-within:border-accent/50">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-7 flex-1 bg-transparent text-xs text-fg outline-none placeholder:text-muted"
            />
            <ToggleIcon
              active={caseSensitive}
              onClick={() => setCaseSensitive((v) => !v)}
              label="Case sensitive"
            >
              <CaseSensitive size={12} />
            </ToggleIcon>
            <ToggleIcon
              active={wholeWord}
              onClick={() => setWholeWord((v) => !v)}
              label="Whole word"
            >
              <WholeWord size={12} />
            </ToggleIcon>
            <ToggleIcon active={regex} onClick={() => setRegex((v) => !v)} label="Regex">
              <Regex size={12} />
            </ToggleIcon>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {showReplace && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 pl-[26px] pt-1.5">
                <div className="flex flex-1 items-center gap-1 rounded-md border border-border bg-bg px-2 focus-within:border-accent/50">
                  <input
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    placeholder="Replace"
                    className="h-7 flex-1 bg-transparent text-xs text-fg outline-none placeholder:text-muted"
                  />
                </div>
                <button
                  onClick={replaceAll}
                  disabled={!query || results.length === 0}
                  title="Replace all"
                  aria-label="Replace all"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-bg text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
                >
                  <Replace size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {query && (
          <div className="pl-[26px] pt-1 text-[10px] uppercase tracking-wider text-muted">
            {error
              ? <span className="text-red-300/90 normal-case tracking-normal">{error}</span>
              : searching
                ? 'Searching…'
                : results.length === 0
                  ? 'No matches'
                  : `${totalHits} hit${totalHits === 1 ? '' : 's'} in ${results.length} file${
                      results.length === 1 ? '' : 's'
                    }`}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {results.map((r) => {
          const isCollapsed = collapsed.has(r.path);
          const name = basename(r.path);
          const lang = languageFor(name);
          const rel = r.path.startsWith(rootPath) ? r.path.slice(rootPath.length).replace(/^[\\/]/, '') : r.path;
          const dir = rel.slice(0, rel.length - name.length).replace(/[\\/]+$/, '');
          return (
            <div key={r.path}>
              <button
                onClick={() => toggleCollapse(r.path)}
                className="flex w-full items-center gap-1 px-2 py-1 text-left transition-colors hover:bg-elevated"
              >
                <ChevronRight
                  size={10}
                  style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
                  className="shrink-0 text-muted transition-transform"
                />
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: lang.color }}
                />
                <span className="truncate text-xs text-fg">{name}</span>
                {dir && <span className="truncate text-[10px] text-muted">{dir}</span>}
                <span className="ml-auto rounded bg-elevated px-1.5 py-px text-[10px] text-muted">
                  {r.hits.length}
                </span>
              </button>
              {!isCollapsed && (
                <div>
                  {r.hits.map((hit, i) => (
                    <HitRow
                      key={i}
                      hit={hit}
                      onClick={() => onOpenAt(r.path, name, hit.line, hit.column)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HitRow({ hit, onClick }: { hit: SearchHit; onClick: () => void }) {
  const before = hit.preview.slice(0, hit.column - 1);
  const match = hit.preview.slice(hit.column - 1, hit.column - 1 + hit.length);
  const after = hit.preview.slice(hit.column - 1 + hit.length);
  return (
    <button
      onClick={onClick}
      className="block w-full truncate px-2 py-[2px] pl-7 text-left font-mono text-[11px] text-fg/70 transition-colors hover:bg-elevated"
    >
      <span>{before}</span>
      <span className="rounded bg-accent/25 px-0.5 text-fg">{match}</span>
      <span>{after}</span>
    </button>
  );
}

function ToggleIcon({
  active,
  onClick,
  label,
  children
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
        active ? 'bg-accent/20 text-accent' : 'text-muted hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}
