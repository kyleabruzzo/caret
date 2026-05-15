import type { PropsWithChildren } from 'react';
import { Minus, Square, X, Copy } from 'lucide-react';
import { useWindowState } from '../hooks/useWindowState';
import { MenuBar, type MenuSection } from './MenuBar';
import logo from '../assets/caret-logo.png';

type Props = {
  folderName: string | null;
  activeFile: string | null;
  menus: MenuSection[];
};

export function TitleBar({ folderName, activeFile, menus }: Props) {
  const { maximized, minimize, toggleMaximize, close } = useWindowState();

  return (
    <div className="titlebar-drag flex h-9 shrink-0 items-center border-b border-border bg-bg pl-3 text-xs text-muted">
      <div className="titlebar-nodrag mr-3 flex items-center gap-1.5">
        <img src={logo} alt="caret" draggable={false} className="h-4 w-4 select-none" />
        <span className="font-medium tracking-wide text-accent">caret</span>
      </div>
      <MenuBar menus={menus} />
      <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-4 text-[11px]">
        {folderName && <span className="truncate text-fg/70">{folderName}</span>}
        {activeFile && (
          <>
            <span className="text-border">/</span>
            <span className="truncate text-muted">{activeFile}</span>
          </>
        )}
      </div>
      <div className="titlebar-nodrag flex items-center">
        <Button onClick={minimize} label="Minimize">
          <Minus size={13} />
        </Button>
        <Button onClick={toggleMaximize} label={maximized ? 'Restore' : 'Maximize'}>
          {maximized ? <Copy size={11} /> : <Square size={11} />}
        </Button>
        <Button onClick={close} label="Close" danger>
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}

type ButtonProps = PropsWithChildren<{
  onClick: () => void;
  label: string;
  danger?: boolean;
}>;

function Button({ children, onClick, label, danger = false }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-11 items-center justify-center text-muted transition-colors duration-150 hover:text-fg ${
        danger ? 'hover:bg-red-500/80 hover:text-white' : 'hover:bg-elevated'
      }`}
    >
      {children}
    </button>
  );
}
