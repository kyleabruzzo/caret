import { useCallback, useEffect, useState } from 'react';
import type { TreeNode, TreeDirectory } from '../../shared/types';

type FileTree = {
  root: TreeNode[];
  expanded: Set<string>;
  loading: boolean;
  toggle: (dir: TreeDirectory) => Promise<void>;
  refresh: () => Promise<void>;
  refreshDir: (path: string) => Promise<void>;
};

export function useFileTree(rootPath: string | null): FileTree {
  const [root, setRoot] = useState<TreeNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadRoot = useCallback(async () => {
    if (!rootPath) {
      setRoot([]);
      return;
    }
    setLoading(true);
    try {
      const nodes = await window.caret.fs.readDir(rootPath);
      setRoot(nodes);
    } finally {
      setLoading(false);
    }
  }, [rootPath]);

  useEffect(() => {
    setExpanded(new Set());
    loadRoot();
  }, [loadRoot]);

  const toggle = useCallback(
    async (dir: TreeDirectory) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(dir.path)) next.delete(dir.path);
        else next.add(dir.path);
        return next;
      });
      if (dir.children === null) {
        const children = await window.caret.fs.readDir(dir.path);
        setRoot((prev) => patchChildren(prev, dir.path, children));
      }
    },
    []
  );

  const refreshDir = useCallback(
    async (path: string) => {
      if (path === rootPath) {
        await loadRoot();
        return;
      }
      const children = await window.caret.fs.readDir(path);
      setRoot((prev) => patchChildren(prev, path, children));
    },
    [rootPath, loadRoot]
  );

  return { root, expanded, loading, toggle, refresh: loadRoot, refreshDir };
}

function patchChildren(nodes: TreeNode[], target: string, children: TreeNode[]): TreeNode[] {
  return nodes.map((node) => {
    if (node.type !== 'directory') return node;
    if (node.path === target) return { ...node, children };
    if (node.children) return { ...node, children: patchChildren(node.children, target, children) };
    return node;
  });
}
