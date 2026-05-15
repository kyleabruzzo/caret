import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { TreeNode, TreeDirectory } from '../../shared/types';
import { languageFor } from '../lib/languages';
import { parentOf } from '../lib/paths';
import { DraftRow, RenameRow } from './FileTreeInputs';

const ROW_PAD = 8;
const DEPTH_PX = 12;

export type RowHandlers = {
  expanded: Set<string>;
  activePath: string | null;
  renaming: string | null;
  draftParent: string | null;
  draftKind: 'file' | 'folder';
  onToggleDir: (dir: TreeDirectory) => void;
  onOpenFile: (path: string, name: string) => void;
  onContextMenu: (e: React.MouseEvent, node: TreeNode | null, parentDir: string) => void;
  onCommitRename: (oldPath: string, newName: string) => void;
  onCommitDraft: (name: string) => void;
};

type ListProps = RowHandlers & {
  nodes: TreeNode[];
  depth: number;
  parentDir: string;
};

export function NodeList(p: ListProps) {
  return (
    <>
      {p.draftParent === p.parentDir && (
        <DraftRow depth={p.depth} kind={p.draftKind} onCommit={p.onCommitDraft} />
      )}
      {p.nodes.map((node) => (
        <NodeRow key={node.path} {...p} node={node} depth={p.depth} />
      ))}
    </>
  );
}

type RowProps = RowHandlers & {
  node: TreeNode;
  depth: number;
};

function NodeRow(p: RowProps) {
  const { node, depth } = p;
  const isOpen = node.type === 'directory' && p.expanded.has(node.path);
  const isActive = p.activePath === node.path;
  const lang = node.type === 'file' ? languageFor(node.name) : null;

  if (p.renaming === node.path) {
    return (
      <RenameRow
        depth={depth}
        initial={node.name}
        isDir={node.type === 'directory'}
        onCommit={(name) => p.onCommitRename(node.path, name)}
      />
    );
  }

  const handleClick = (): void => {
    if (node.type === 'directory') p.onToggleDir(node);
    else p.onOpenFile(node.path, node.name);
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.12 }}
        onClick={handleClick}
        onContextMenu={(e) => p.onContextMenu(e, node, parentOf(node.path))}
        className={`group flex w-full items-center gap-1.5 py-[3px] pr-2 text-left text-xs transition-colors duration-150 ${
          isActive ? 'bg-elevated text-fg' : 'text-fg/80 hover:bg-elevated/60 hover:text-fg'
        }`}
        style={{ paddingLeft: ROW_PAD + depth * DEPTH_PX }}
      >
        {node.type === 'directory' ? (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="flex h-3 w-3 items-center justify-center text-muted"
          >
            <ChevronRight size={11} />
          </motion.span>
        ) : (
          <span className="flex h-3 w-3 items-center justify-center">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: lang?.color }}
            />
          </span>
        )}
        <span className="truncate">{node.name}</span>
      </motion.button>
      {node.type === 'directory' && isOpen && node.children && (
        <NodeList
          nodes={node.children}
          depth={depth + 1}
          parentDir={node.path}
          expanded={p.expanded}
          activePath={p.activePath}
          renaming={p.renaming}
          draftParent={p.draftParent}
          draftKind={p.draftKind}
          onToggleDir={p.onToggleDir}
          onOpenFile={p.onOpenFile}
          onContextMenu={p.onContextMenu}
          onCommitRename={p.onCommitRename}
          onCommitDraft={p.onCommitDraft}
        />
      )}
    </>
  );
}
