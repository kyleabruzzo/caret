import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, mergeSettings, type Settings } from '../lib/settings';

type UseSettings = {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
};

export function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.caret.store.get().then((data) => {
      setSettings(mergeSettings(data.settings as Partial<Settings> | undefined));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--caret-accent', settings.accent);
    root.style.setProperty('--caret-bg', settings.bg);
    root.style.setProperty('--caret-panel', settings.panel);
    root.style.setProperty('--caret-font-mono', settings.fontFamilyMono);
    root.style.setProperty('--caret-font-sans', settings.fontFamilySans);
  }, [settings]);

  const persist = useCallback(async (next: Settings) => {
    const current = await window.caret.store.get();
    await window.caret.store.set({ ...current, settings: next as unknown as Record<string, unknown> });
  }, []);

  const update = useCallback<UseSettings['update']>((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, [persist]);

  const reset = useCallback<UseSettings['reset']>(() => {
    setSettings(DEFAULT_SETTINGS);
    persist(DEFAULT_SETTINGS);
  }, [persist]);

  return { settings, ready, update, reset };
}
