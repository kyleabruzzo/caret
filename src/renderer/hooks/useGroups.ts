import { useCallback, useRef, useState } from 'react';

export type TextTab = {
  kind: 'text';
  path: string;
  name: string;
  content: string;
  savedContent: string;
};

export type ImageTab = {
  kind: 'image';
  path: string;
  name: string;
  dataUrl: string;
};

export type Tab = TextTab | ImageTab;

export type EditorGroup = {
  id: string;
  tabs: Tab[];
  activePath: string | null;
};

export type EditorColumn = {
  id: string;
  groups: EditorGroup[];
};

export type DropEdge = 'left' | 'right' | 'top' | 'bottom' | 'center';

const IMAGE_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif',
  '.bmp', '.ico', '.svg', '.apng', '.tiff', '.tif'
]);

function isImagePath(path: string): boolean {
  const dot = path.lastIndexOf('.');
  if (dot === -1) return false;
  return IMAGE_EXTS.has(path.slice(dot).toLowerCase());
}

let nextGroupId = 1;
let nextColumnId = 1;
const makeGroup = (tabs: Tab[] = [], activePath: string | null = null): EditorGroup => ({
  id: `g${nextGroupId++}`,
  tabs,
  activePath
});
const makeColumn = (groups: EditorGroup[]): EditorColumn => ({
  id: `c${nextColumnId++}`,
  groups
});

type Groups = {
  columns: EditorColumn[];
  activeGroupId: string;
  setActiveGroup: (id: string) => void;
  setActiveTab: (groupId: string, path: string) => void;
  open: (path: string, name: string) => Promise<void>;
  close: (groupId: string, path: string) => Promise<void>;
  updateContent: (groupId: string, path: string, content: string) => void;
  save: (groupId: string, path: string) => Promise<void>;
  saveAll: () => Promise<void>;
  renamePath: (oldPath: string, newPath: string, newName: string) => void;
  closeUnder: (dirPath: string) => void;
  moveTab: (
    source: { groupId: string; path: string },
    target: { groupId: string; edge: DropEdge }
  ) => void;
};

export function useGroups(): Groups {
  const [columns, setColumns] = useState<EditorColumn[]>(() => [makeColumn([makeGroup()])]);
  const [activeGroupId, setActiveGroupIdState] = useState<string>(() => columns[0].groups[0].id);
  const colsRef = useRef(columns);
  colsRef.current = columns;

  const setActiveGroup = useCallback((id: string) => setActiveGroupIdState(id), []);

  const setActiveTab = useCallback<Groups['setActiveTab']>((groupId, path) => {
    setActiveGroupIdState(groupId);
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        groups: col.groups.map((g) => (g.id === groupId ? { ...g, activePath: path } : g))
      }))
    );
  }, []);

  const open = useCallback<Groups['open']>(async (path, name) => {
    const targetGroupId = activeGroupId;
    setActiveGroupIdState(targetGroupId);

    const existing = findGroup(colsRef.current, targetGroupId);
    if (existing?.tabs.some((t) => t.path === path)) {
      setColumns((prev) => mapGroup(prev, targetGroupId, (g) => ({ ...g, activePath: path })));
      return;
    }

    const tab: Tab = isImagePath(path)
      ? { kind: 'image', path, name, dataUrl: await window.caret.fs.readBase64(path) }
      : await readTextTab(path, name);

    setColumns((prev) =>
      mapGroup(prev, targetGroupId, (g) => {
        if (g.tabs.some((t) => t.path === path)) return { ...g, activePath: path };
        return { ...g, tabs: [...g.tabs, tab], activePath: path };
      })
    );
  }, [activeGroupId]);

  const close = useCallback<Groups['close']>(async (groupId, path) => {
    const group = findGroup(colsRef.current, groupId);
    const tab = group?.tabs.find((t) => t.path === path);
    if (tab?.kind === 'text' && tab.content !== tab.savedContent) {
      await window.caret.fs.writeFile(path, tab.content);
    }
    setColumns((prev) => removeTab(prev, groupId, path));
    setActiveGroupIdState((curr) => {
      if (curr !== groupId) return curr;
      const remaining = findGroup(colsRef.current, groupId);
      if (remaining) return curr;
      const first = colsRef.current[0]?.groups[0];
      return first?.id ?? curr;
    });
  }, []);

  const updateContent = useCallback<Groups['updateContent']>((groupId, path, content) => {
    setColumns((prev) =>
      mapGroup(prev, groupId, (g) => ({
        ...g,
        tabs: g.tabs.map((t) =>
          t.path === path && t.kind === 'text' ? { ...t, content } : t
        )
      }))
    );
  }, []);

  const save = useCallback<Groups['save']>(async (groupId, path) => {
    const group = findGroup(colsRef.current, groupId);
    const tab = group?.tabs.find((t) => t.path === path);
    if (!tab || tab.kind !== 'text' || tab.content === tab.savedContent) return;
    await window.caret.fs.writeFile(path, tab.content);
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        groups: col.groups.map((g) => ({
          ...g,
          tabs: g.tabs.map((t) =>
            t.path === path && t.kind === 'text' ? { ...t, savedContent: t.content } : t
          )
        }))
      }))
    );
  }, []);

  const saveAll = useCallback<Groups['saveAll']>(async () => {
    const writes: Array<{ path: string; content: string }> = [];
    const seen = new Set<string>();
    for (const col of colsRef.current) {
      for (const g of col.groups) {
        for (const t of g.tabs) {
          if (t.kind !== 'text' || t.content === t.savedContent) continue;
          if (seen.has(t.path)) continue;
          seen.add(t.path);
          writes.push({ path: t.path, content: t.content });
        }
      }
    }
    if (writes.length === 0) return;
    await Promise.all(writes.map((w) => window.caret.fs.writeFile(w.path, w.content)));
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        groups: col.groups.map((g) => ({
          ...g,
          tabs: g.tabs.map((t) =>
            seen.has(t.path) && t.kind === 'text' ? { ...t, savedContent: t.content } : t
          )
        }))
      }))
    );
  }, []);

  const renamePath = useCallback<Groups['renamePath']>((oldPath, newPath, newName) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        groups: col.groups.map((g) => ({
          ...g,
          tabs: g.tabs.map((t) =>
            t.path === oldPath ? { ...t, path: newPath, name: newName } : t
          ),
          activePath: g.activePath === oldPath ? newPath : g.activePath
        }))
      }))
    );
  }, []);

  const closeUnder = useCallback<Groups['closeUnder']>((dirPath) => {
    const sep = dirPath.includes('\\') ? '\\' : '/';
    const prefix = dirPath.endsWith(sep) ? dirPath : dirPath + sep;
    const isUnder = (p: string): boolean => p === dirPath || p.startsWith(prefix);
    setColumns((prev) => {
      const next: EditorColumn[] = [];
      for (const col of prev) {
        const groups: EditorGroup[] = [];
        for (const g of col.groups) {
          const tabs = g.tabs.filter((t) => !isUnder(t.path));
          const activePath = g.activePath && !isUnder(g.activePath) ? g.activePath : tabs[0]?.path ?? null;
          if (tabs.length > 0) groups.push({ ...g, tabs, activePath });
        }
        if (groups.length > 0) next.push({ ...col, groups });
      }
      return ensureNonEmpty(next);
    });
  }, []);

  const moveTab = useCallback<Groups['moveTab']>((source, target) => {
    setColumns((prev) => {
      const sourceGroup = findGroup(prev, source.groupId);
      const tab = sourceGroup?.tabs.find((t) => t.path === source.path);
      if (!sourceGroup || !tab) return prev;

      if (source.groupId === target.groupId && target.edge === 'center') return prev;

      let next = removeTab(prev, source.groupId, source.path);
      const targetGroupStillExists = findGroup(next, target.groupId);

      if (!targetGroupStillExists) {
        const newGroup = makeGroup([tab], tab.path);
        next = [...next, makeColumn([newGroup])];
        setActiveGroupIdState(newGroup.id);
        return ensureNonEmpty(next);
      }

      if (target.edge === 'center') {
        next = mapGroup(next, target.groupId, (g) => {
          if (g.tabs.some((t) => t.path === tab.path)) return { ...g, activePath: tab.path };
          return { ...g, tabs: [...g.tabs, tab], activePath: tab.path };
        });
        setActiveGroupIdState(target.groupId);
        return ensureNonEmpty(next);
      }

      const newGroup = makeGroup([tab], tab.path);
      const colIdx = next.findIndex((c) => c.groups.some((g) => g.id === target.groupId));
      if (colIdx === -1) return ensureNonEmpty(next);

      if (target.edge === 'left' || target.edge === 'right') {
        const newCol = makeColumn([newGroup]);
        const insertAt = target.edge === 'left' ? colIdx : colIdx + 1;
        next = [...next.slice(0, insertAt), newCol, ...next.slice(insertAt)];
      } else {
        const col = next[colIdx];
        const groupIdx = col.groups.findIndex((g) => g.id === target.groupId);
        const insertAt = target.edge === 'top' ? groupIdx : groupIdx + 1;
        const newGroups = [...col.groups.slice(0, insertAt), newGroup, ...col.groups.slice(insertAt)];
        next = [...next.slice(0, colIdx), { ...col, groups: newGroups }, ...next.slice(colIdx + 1)];
      }
      setActiveGroupIdState(newGroup.id);
      return ensureNonEmpty(next);
    });
  }, []);

  return {
    columns,
    activeGroupId,
    setActiveGroup,
    setActiveTab,
    open,
    close,
    updateContent,
    save,
    saveAll,
    renamePath,
    closeUnder,
    moveTab
  };
}

async function readTextTab(path: string, name: string): Promise<TextTab> {
  const content = await window.caret.fs.readFile(path);
  return { kind: 'text', path, name, content, savedContent: content };
}

function findGroup(columns: EditorColumn[], groupId: string): EditorGroup | undefined {
  for (const col of columns) {
    const g = col.groups.find((x) => x.id === groupId);
    if (g) return g;
  }
  return undefined;
}

function mapGroup(
  columns: EditorColumn[],
  groupId: string,
  fn: (g: EditorGroup) => EditorGroup
): EditorColumn[] {
  return columns.map((col) => ({
    ...col,
    groups: col.groups.map((g) => (g.id === groupId ? fn(g) : g))
  }));
}

function removeTab(columns: EditorColumn[], groupId: string, path: string): EditorColumn[] {
  const next: EditorColumn[] = [];
  for (const col of columns) {
    const groups: EditorGroup[] = [];
    for (const g of col.groups) {
      if (g.id !== groupId) {
        groups.push(g);
        continue;
      }
      const idx = g.tabs.findIndex((t) => t.path === path);
      if (idx === -1) {
        groups.push(g);
        continue;
      }
      const tabs = g.tabs.filter((t) => t.path !== path);
      let activePath: string | null = g.activePath;
      if (g.activePath === path) {
        activePath = tabs[idx]?.path ?? tabs[idx - 1]?.path ?? null;
      }
      if (tabs.length === 0) continue;
      groups.push({ ...g, tabs, activePath });
    }
    if (groups.length > 0) next.push({ ...col, groups });
  }
  return ensureNonEmpty(next);
}

function ensureNonEmpty(columns: EditorColumn[]): EditorColumn[] {
  if (columns.length === 0 || columns.every((c) => c.groups.length === 0)) {
    return [makeColumn([makeGroup()])];
  }
  return columns;
}
