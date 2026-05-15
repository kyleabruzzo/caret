import { useMemo, useState } from 'react';
import { Tabs, DRAG_MIME } from './Tabs';
import { EditorPane } from './EditorPane';
import { ImageViewer } from './ImageViewer';
import type { DropEdge, EditorGroup } from '../hooks/useGroups';
import type { Settings } from '../lib/settings';

type Props = {
  group: EditorGroup;
  isActive: boolean;
  dragActive: boolean;
  settings: Settings;
  onFocusGroup: () => void;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onTabDragStart: (groupId: string, path: string) => void;
  onTabDragEnd: () => void;
  onDrop: (target: { groupId: string; edge: DropEdge }) => void;
  onChange: (path: string, content: string) => void;
  onSave: (path: string) => void;
};

export function EditorGroupView({
  group,
  isActive,
  dragActive,
  settings,
  onFocusGroup,
  onSelectTab,
  onCloseTab,
  onTabDragStart,
  onTabDragEnd,
  onDrop,
  onChange,
  onSave
}: Props) {
  const activeTab = useMemo(
    () => group.tabs.find((t) => t.path === group.activePath) ?? null,
    [group.tabs, group.activePath]
  );

  return (
    <div
      onMouseDown={onFocusGroup}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-bg"
    >
      {isActive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[1px] bg-accent/60"
        />
      )}
      <Tabs
        groupId={group.id}
        tabs={group.tabs}
        activePath={group.activePath}
        onSelect={onSelectTab}
        onClose={onCloseTab}
        onDragStart={onTabDragStart}
        onDragEnd={onTabDragEnd}
      />
      <div className="relative min-h-0 flex-1">
        {activeTab ? (
          activeTab.kind === 'image' ? (
            <ImageViewer tab={activeTab} />
          ) : (
            <EditorPane
              tab={activeTab}
              settings={settings}
              onChange={onChange}
              onSave={onSave}
              onFocus={onFocusGroup}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No file open
          </div>
        )}
        {dragActive && <DropOverlay groupId={group.id} onDrop={onDrop} />}
      </div>
    </div>
  );
}

type Zone = { edge: DropEdge; rect: string };

const ZONES: Zone[] = [
  { edge: 'top',    rect: 'left-0 right-0 top-0 h-1/4' },
  { edge: 'bottom', rect: 'left-0 right-0 bottom-0 h-1/4' },
  { edge: 'left',   rect: 'top-1/4 bottom-1/4 left-0 w-1/4' },
  { edge: 'right',  rect: 'top-1/4 bottom-1/4 right-0 w-1/4' },
  { edge: 'center', rect: 'left-1/4 right-1/4 top-1/4 bottom-1/4' }
];

function DropOverlay({
  groupId,
  onDrop
}: {
  groupId: string;
  onDrop: (target: { groupId: string; edge: DropEdge }) => void;
}) {
  const [hover, setHover] = useState<DropEdge | null>(null);

  const accept = (e: React.DragEvent): boolean => {
    return e.dataTransfer.types.includes(DRAG_MIME);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {ZONES.map((z) => (
        <div
          key={z.edge}
          className={`pointer-events-auto absolute ${z.rect}`}
          onDragOver={(e) => {
            if (!accept(e)) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setHover(z.edge);
          }}
          onDragLeave={() => {
            setHover((curr) => (curr === z.edge ? null : curr));
          }}
          onDrop={(e) => {
            if (!accept(e)) return;
            e.preventDefault();
            setHover(null);
            onDrop({ groupId, edge: z.edge });
          }}
        />
      ))}
      {hover && <Highlight edge={hover} />}
    </div>
  );
}

function Highlight({ edge }: { edge: DropEdge }) {
  const rect = (() => {
    switch (edge) {
      case 'top':    return 'left-0 right-0 top-0 bottom-1/2';
      case 'bottom': return 'left-0 right-0 top-1/2 bottom-0';
      case 'left':   return 'top-0 bottom-0 left-0 right-1/2';
      case 'right':  return 'top-0 bottom-0 left-1/2 right-0';
      case 'center': return 'inset-0';
    }
  })();
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${rect} border border-accent/60 bg-accent/15 transition-all duration-100`}
    />
  );
}
