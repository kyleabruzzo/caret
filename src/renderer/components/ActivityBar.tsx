import type { ReactNode } from 'react';
import { FolderTree, Search, Settings, Sparkles } from 'lucide-react';
import type { SidebarView } from './Sidebar';

type Props = {
  sidebarOpen: boolean;
  view: SidebarView;
  ambient: boolean;
  onSelectExplorer: () => void;
  onSelectSearch: () => void;
  onToggleAmbient: () => void;
  onOpenSettings: () => void;
};

export function ActivityBar(props: Props) {
  const showExplorerActive = props.sidebarOpen && props.view === 'explorer';
  const showSearchActive = props.sidebarOpen && props.view === 'search';

  return (
    <nav className="flex w-11 shrink-0 flex-col items-center justify-between border-r border-border bg-bg py-2">
      <div className="flex flex-col items-center gap-1">
        <Item label="Explorer" active={showExplorerActive} onClick={props.onSelectExplorer}>
          <FolderTree size={16} />
        </Item>
        <Item label="Search" active={showSearchActive} onClick={props.onSelectSearch}>
          <Search size={15} />
        </Item>
        <Item label="Ambient particles" active={props.ambient} onClick={props.onToggleAmbient}>
          <Sparkles size={15} />
        </Item>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Item label="Settings" onClick={props.onOpenSettings}>
          <Settings size={15} />
        </Item>
      </div>
    </nav>
  );
}

type ItemProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function Item({ label, active = false, onClick, children }: ItemProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active ? 'text-fg' : 'text-muted hover:text-fg'
      }`}
    >
      {active && (
        <span className="absolute -left-2 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded bg-accent" />
      )}
      {children}
    </button>
  );
}
