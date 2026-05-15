import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type MenuItem =
  | { type: 'separator' }
  | {
      type: 'item';
      label: string;
      shortcut?: string;
      onSelect: () => void;
      disabled?: boolean;
    };

export type MenuSection = {
  label: string;
  items: MenuItem[];
};

type Props = {
  menus: MenuSection[];
};

export function MenuBar({ menus }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openIdx === null) return;
    const onDown = (e: MouseEvent): void => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenIdx(null);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpenIdx(null);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [openIdx]);

  return (
    <div ref={wrapRef} className="titlebar-nodrag relative flex items-center">
      {menus.map((menu, i) => (
        <div key={menu.label} className="relative">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            onMouseEnter={() => openIdx !== null && setOpenIdx(i)}
            className={`h-7 rounded px-2 text-[12px] transition-colors ${
              openIdx === i ? 'bg-elevated text-fg' : 'text-fg/75 hover:text-fg'
            }`}
          >
            {menu.label}
          </button>
          <AnimatePresence>
            {openIdx === i && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.1 }}
                className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-md border border-border bg-panel py-1 shadow-2xl"
              >
                {menu.items.map((item, j) =>
                  item.type === 'separator' ? (
                    <div key={`sep-${j}`} className="my-1 h-px bg-border" />
                  ) : (
                    <button
                      key={item.label}
                      disabled={item.disabled}
                      onClick={() => {
                        if (item.disabled) return;
                        item.onSelect();
                        setOpenIdx(null);
                      }}
                      className="flex w-full items-center justify-between px-3 py-1 text-left text-xs transition-colors disabled:opacity-40 enabled:hover:bg-elevated enabled:hover:text-fg text-fg/85"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="ml-6 text-[10px] tracking-wider text-muted">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
