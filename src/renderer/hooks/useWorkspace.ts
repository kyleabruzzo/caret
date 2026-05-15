import { useCallback, useEffect, useState } from 'react';

type Workspace = {
  folder: string | null;
  ready: boolean;
  openFolder: () => Promise<void>;
  closeFolder: () => Promise<void>;
};

export function useWorkspace(): Workspace {
  const [folder, setFolder] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    window.caret.store.get().then((data) => {
      if (data.lastFolder) setFolder(data.lastFolder);
      setReady(true);
    });
  }, []);

  const openFolder = useCallback(async () => {
    const path = await window.caret.dialog.openFolder();
    if (!path) return;
    setFolder(path);
    await window.caret.store.set({ lastFolder: path });
  }, []);

  const closeFolder = useCallback(async () => {
    setFolder(null);
    await window.caret.store.set({});
  }, []);

  return { folder, ready, openFolder, closeFolder };
}
