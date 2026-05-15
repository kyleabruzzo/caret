import { useEffect } from 'react';

export type ChordHandler = (key: string, e: KeyboardEvent) => boolean;

export function useChord(leader: string, handler: ChordHandler): void {
  useEffect(() => {
    let armed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const disarm = (): void => {
      armed = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const onKey = (e: KeyboardEvent): void => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();

      if (armed) {
        const handled = handler(key, e);
        disarm();
        if (handled) e.preventDefault();
        return;
      }

      if (key === leader.toLowerCase()) {
        e.preventDefault();
        armed = true;
        timer = setTimeout(disarm, 1200);
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      disarm();
    };
  }, [leader, handler]);
}
