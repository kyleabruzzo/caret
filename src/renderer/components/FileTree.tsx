import { useEffect, useState } from 'react';
import type { TreeNode, TreeDirectory } from '../../shared/types';
import { FileTreeMenu } from './FileTreeMenu';
import { NodeList } from './FileTreeNode';

type Props = {
  rootPath: string;
  nodes: TreeNode[];
  expanded: Set<string>;
  activePath: string | null;
  onToggleDir: (dir: TreeDirectory) => void;
  onOpenFile: (path: string, name: string) => void;
  onCreate: (parentDir: string, name: string, kind: 'file' | 'folder') => void;
  onRename: (oldPath: string, newName: string) => void;
  onDelete: (path: string) => void;
};

type Menu = {
  x: number;
  y: number;
  node: TreeNode | null;
  parentDir: string;
};

type Draft = {
  parentDir: string;
  kind: 'file' | 'folder';
};

export function FileTree(props: Props) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    const dismiss = (): void => setMenu(null);
    window.addEventListener('click', dismiss);
    window.addEventListener('blur', dismiss);
    window.addEventListener('resize', dismiss);
    return () => {
      window.removeEventListener('click', dismiss);
      window.removeEventListener('blur', dismiss);
      window.removeEventListener('resize', dismiss);
    };
  }, []);

  const openMenu = (e: React.MouseEvent, node: TreeNode | null, parentDir: string): void => {
    e.preventDefault();
    e.stopPropagation();
    setMenu({ x: e.clientX, y: e.clientY, node, parentDir });
  };

  const startDraft = (kind: 'file' | 'folder'): void => {
    if (!menu) return;
    const parent = menu.node?.type === 'directory' ? menu.node.path : menu.parentDir;
    if (menu.node?.type === 'directory' && !props.expanded.has(menu.node.path)) {
      props.onToggleDir(menu.node);
    }
    setDraft({ parentDir: parent, kind });
    setMenu(null);
  };

  return (
    <div onContextMenu={(e) => openMenu(e, null, props.rootPath)} className="h-full">
      <NodeList
        nodes={props.nodes}
        depth={0}
        parentDir={props.rootPath}
        expanded={props.expanded}
        activePath={props.activePath}
        renaming={renaming}
        draftParent={draft?.parentDir ?? null}
        draftKind={draft?.kind ?? 'file'}
        onToggleDir={props.onToggleDir}
        onOpenFile={props.onOpenFile}
        onContextMenu={openMenu}
        onCommitRename={(oldPath, newName) => {
          setRenaming(null);
          if (newName) props.onRename(oldPath, newName);
        }}
        onCommitDraft={(name) => {
          if (draft && name) props.onCreate(draft.parentDir, name, draft.kind);
          setDraft(null);
        }}
      />
      {menu && (
        <FileTreeMenu
          x={menu.x}
          y={menu.y}
          node={menu.node}
          onNewFile={() => startDraft('file')}
          onNewFolder={() => startDraft('folder')}
          onRename={() => {
            if (menu.node) setRenaming(menu.node.path);
            setMenu(null);
          }}
          onDelete={() => {
            if (menu.node) props.onDelete(menu.node.path);
            setMenu(null);
          }}
        />
      )}
    </div>
  );
}
