import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import logo from '../assets/caret-logo.png';

type Props = {
  onOpen: () => void;
};

export function Welcome({ onOpen }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="flex h-full flex-col items-center justify-center gap-7 px-6 text-center"
    >
      <motion.img
        src={logo}
        alt="caret"
        draggable={false}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="h-24 w-24 select-none"
      />
      <div className="space-y-2">
        <h1 className="text-4xl font-medium tracking-tight text-fg">caret</h1>
        <p className="text-sm text-muted">a minimal coding workspace</p>
      </div>
      <button
        onClick={onOpen}
        className="flex items-center gap-2 rounded-md border border-border bg-elevated px-4 py-2 text-xs text-fg transition-colors duration-200 hover:border-accent/40 hover:text-accent"
      >
        <FolderOpen size={13} />
        Open folder
      </button>
      <div className="text-[11px] tracking-wide text-muted">
        Ctrl B sidebar &nbsp;·&nbsp; Ctrl P open file &nbsp;·&nbsp; Ctrl S save &nbsp;·&nbsp; Ctrl , settings
      </div>
    </motion.div>
  );
}
