import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ImageTab } from '../hooks/useGroups';

type Props = {
  tab: ImageTab;
};

export function ImageViewer({ tab }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    setDims(null);
  }, [tab.path]);

  return (
    <motion.div
      key={tab.path}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      className="relative flex h-full flex-col items-center justify-center overflow-auto bg-bg p-8"
      style={{ backgroundImage: checker(), backgroundSize: '20px 20px' }}
    >
      <img
        ref={ref}
        src={tab.dataUrl}
        alt={tab.name}
        onLoad={(e) => {
          const img = e.currentTarget;
          setDims({ w: img.naturalWidth, h: img.naturalHeight });
        }}
        className="max-h-[calc(100%-2.5rem)] max-w-full object-contain shadow-2xl"
        draggable={false}
      />
      <div className="mt-4 flex items-center gap-3 text-[11px] text-muted">
        <span className="font-mono text-fg/80">{tab.name}</span>
        {dims && (
          <>
            <span className="text-border">·</span>
            <span>{dims.w} × {dims.h}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function checker(): string {
  const c = '#101012';
  return `linear-gradient(45deg, ${c} 25%, transparent 25%), linear-gradient(-45deg, ${c} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c} 75%), linear-gradient(-45deg, transparent 75%, ${c} 75%)`;
}
