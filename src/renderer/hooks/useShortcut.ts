import { useEffect } from 'react';

type Combo = {
  key: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useShortcut(combo: Combo, handler: () => void): void {
  useEffect(() => {
    const fn = (e: KeyboardEvent): void => {
      if (combo.mod && !(e.ctrlKey || e.metaKey)) return;
      if (!combo.mod && (e.ctrlKey || e.metaKey)) return;
      if (combo.shift && !e.shiftKey) return;
      if (!combo.shift && e.shiftKey) return;
      if (combo.alt && !e.altKey) return;
      if (!combo.alt && e.altKey) return;
      if (e.key.toLowerCase() !== combo.key.toLowerCase()) return;
      e.preventDefault();
      handler();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [combo.mod, combo.key, combo.shift, combo.alt, handler]);
}
