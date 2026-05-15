import type { PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import type { TreeNode } from '../../shared/types';

type Props = {
  x: number;
  y: number;
  node: TreeNode | null;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename: () => void;
  onDelete: () => void;
};

export function FileTreeMenu({ x, y, node, onNewFile, onNewFolder, onRename, onDelete }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -3, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.1, ease: [0.4, 0, 0.2, 1] }}
      style={{ left: x, top: y }}
      className="fixed z-50 min-w-[160px] rounded-md border border-border bg-panel py-1 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <Item onClick={onNewFile}>New file</Item>
      <Item onClick={onNewFolder}>New folder</Item>
      {node && (
        <>
          <div className="my-1 h-px bg-border" />
          <Item onClick={onRename}>Rename</Item>
          <Item onClick={onDelete} danger>
            Delete
          </Item>
        </>
      )}
    </motion.div>
  );
}

function Item({
  children,
  onClick,
  danger = false
}: PropsWithChildren<{ onClick: () => void; danger?: boolean }>) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-3 py-1 text-left text-xs transition-colors ${
        danger ? 'text-red-300/90 hover:bg-red-500/15' : 'text-fg/85 hover:bg-elevated'
      }`}
    >
      {children}
    </button>
  );
}
