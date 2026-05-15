import type { PropsWithChildren, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, RefreshCw } from 'lucide-react';
import { FileTree } from './FileTree';
import { SearchPanel } from './SearchPanel';
import { basename } from '../lib/paths';
import type { TreeNode, TreeDirectory } from '../../shared/types';

export type SidebarView = 'explorer' | 'search';

type Props = {
  open: boolean;
  view: SidebarView;
  folder: string | null;
  nodes: TreeNode[];
  expanded: Set<string>;
  activePath: string | null;
  onOpenFolder: () => void;
  onRefresh: () => void;
  onToggleDir: (dir: TreeDirectory) => void;
  onOpenFile: (path: string, name: string) => void;
  onOpenFileAt: (path: string, name: string, line: number, column: number) => void;
  onCreate: (parentDir: string, name: string, kind: 'file' | 'folder') => void;
  onRename: (oldPath: string, newName: string) => void;
  onDelete: (path: string) => void;
};

export function Sidebar(props: Props) {
  return (
    <AnimatePresence initial={false}>
      {props.open && (
        <motion.aside
          key="sidebar"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-panel"
        >
          {props.view === 'explorer' ? (
            <ExplorerView {...props} />
          ) : (
            <SearchView folder={props.folder} onOpenFileAt={props.onOpenFileAt} />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function ExplorerView(props: Props) {
  return (
    <>
      <Header
        label={props.folder ? basename(props.folder) : 'Explorer'}
        actions={
          props.folder ? (
            <>
              <IconBtn onClick={props.onRefresh} label="Refresh">
                <RefreshCw size={11} />
              </IconBtn>
              <IconBtn onClick={props.onOpenFolder} label="Open folder">
                <FolderOpen size={12} />
              </IconBtn>
            </>
          ) : null
        }
      />
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {!props.folder ? (
          <Empty onOpen={props.onOpenFolder} />
        ) : (
          <FileTree
            rootPath={props.folder}
            nodes={props.nodes}
            expanded={props.expanded}
            activePath={props.activePath}
            onToggleDir={props.onToggleDir}
            onOpenFile={props.onOpenFile}
            onCreate={props.onCreate}
            onRename={props.onRename}
            onDelete={props.onDelete}
          />
        )}
      </div>
    </>
  );
}

function SearchView({
  folder,
  onOpenFileAt
}: {
  folder: string | null;
  onOpenFileAt: (path: string, name: string, line: number, column: number) => void;
}) {
  return (
    <>
      <Header label="Search" />
      {folder ? (
        <SearchPanel rootPath={folder} onOpenAt={onOpenFileAt} />
      ) : (
        <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-muted">
          Open a folder to search
        </div>
      )}
    </>
  );
}

function Header({ label, actions }: { label: string; actions?: ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between px-3 text-[11px] uppercase tracking-wider text-muted">
      <span className="truncate">{label}</span>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

function IconBtn({ children, onClick, label }: PropsWithChildren<{ onClick: () => void; label: string }>) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-5 w-5 items-center justify-center rounded text-muted transition-colors hover:bg-elevated hover:text-fg"
    >
      {children}
    </button>
  );
}

function Empty({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 pt-10 text-center">
      <p className="text-xs text-muted">No folder open</p>
      <button
        onClick={onOpen}
        className="rounded-md border border-border bg-elevated px-3 py-1.5 text-xs text-fg transition-colors hover:border-accent/40 hover:text-accent"
      >
        Open folder
      </button>
    </div>
  );
}
