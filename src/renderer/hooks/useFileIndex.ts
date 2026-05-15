import { useCallback, useEffect, useRef, useState } from 'react';

type FileIndex = {
  files: string[];
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useFileIndex(root: string | null): FileIndex {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const reqId = useRef(0);

  const load = useCallback(async () => {
    if (!root) {
      setFiles([]);
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    try {
      const list = await window.caret.fs.listFiles(root);
      if (id === reqId.current) setFiles(list);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [root]);

  useEffect(() => {
    load();
  }, [load]);

  return { files, loading, refresh: load };
}
