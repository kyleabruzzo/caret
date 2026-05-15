import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { languageFor } from '../lib/languages';
import type { Tab } from '../hooks/useGroups';

export const DRAG_MIME = 'application/x-caret-tab';

type Props = {
  groupId: string;
  tabs: Tab[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onDragStart: (groupId: string, path: string) => void;
  onDragEnd: () => void;
};

export function Tabs({ groupId, tabs, activePath, onSelect, onClose, onDragStart, onDragEnd }: Props) {
  return (
    <div className="flex h-9 shrink-0 items-center overflow-x-auto border-b border-border bg-panel">
      <AnimatePresence initial={false}>
        {tabs.map((tab) => (
          <TabItem
            key={tab.path}
            tab={tab}
            active={tab.path === activePath}
            onSelect={() => onSelect(tab.path)}
            onClose={() => onClose(tab.path)}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData(
                DRAG_MIME,
                JSON.stringify({ groupId, path: tab.path })
              );
              onDragStart(groupId, tab.path);
            }}
            onDragEnd={onDragEnd}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

type ItemProps = {
  tab: Tab;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
};

function TabItem({ tab, active, onSelect, onClose, onDragStart, onDragEnd }: ItemProps) {
  const lang = languageFor(tab.name);
  const dirty = tab.kind === 'text' && tab.content !== tab.savedContent;

  const dragHandlers = {
    draggable: true,
    onDragStart,
    onDragEnd
  } as unknown as Record<string, unknown>;

  return (
    <motion.div
      layout
      {...dragHandlers}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto' }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={`group relative flex h-9 shrink-0 items-center gap-2 border-r border-border px-3 text-xs transition-colors duration-150 ${
        active ? 'bg-bg text-fg' : 'bg-panel text-fg/60 hover:text-fg/90'
      }`}
    >
      {active && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: lang.color }}
          transition={{ duration: 0.2 }}
        />
      )}
      <button onClick={onSelect} className="flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: lang.color }}
        />
        <span className="whitespace-nowrap">{tab.name}</span>
      </button>
      <button
        onClick={onClose}
        aria-label="Close tab"
        className="flex h-4 w-4 items-center justify-center rounded text-muted transition-colors hover:bg-elevated hover:text-fg"
      >
        {dirty ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-fg/60 group-hover:hidden" />
            <X size={11} className="hidden group-hover:block" />
          </>
        ) : (
          <X size={11} className="opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    </motion.div>
  );
}
