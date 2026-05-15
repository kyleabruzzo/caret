import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hexToHsv, hsvToHex, isValidHex, type HSV } from '../lib/color';

type Props = {
  value: string;
  onChange: (hex: string) => void;
};

export function ColorPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent): void => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label="Pick color"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded border border-border bg-bg px-2 py-1 transition-colors hover:border-fg/30"
      >
        <span
          className="h-4 w-4 rounded border border-border"
          style={{ background: value }}
        />
        <span className="font-mono text-[11px] text-fg/80">{value.toUpperCase()}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 top-full z-50 mt-2 w-[228px] rounded-lg border border-border bg-panel p-3 shadow-2xl"
          >
            <Picker hex={value} onChange={onChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Picker({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(hex));
  const [hexInput, setHexInput] = useState(hex.toUpperCase());

  useEffect(() => {
    setHsv(hexToHsv(hex));
    setHexInput(hex.toUpperCase());
  }, [hex]);

  const emit = (next: HSV): void => {
    const out = hsvToHex(next);
    setHsv(next);
    setHexInput(out.toUpperCase());
    onChange(out);
  };

  const hueColor = hsvToHex({ h: hsv.h, s: 1, v: 1 });

  return (
    <div className="space-y-2.5">
      <SVPad hsv={hsv} hueColor={hueColor} onChange={(s, v) => emit({ ...hsv, s, v })} />
      <HueSlider hue={hsv.h} onChange={(h) => emit({ ...hsv, h })} />
      <div className="flex items-center gap-2">
        <span
          className="h-6 w-6 shrink-0 rounded border border-border"
          style={{ background: hsvToHex(hsv) }}
        />
        <input
          value={hexInput}
          onChange={(e) => {
            const next = e.target.value;
            setHexInput(next);
            if (isValidHex(next)) {
              const norm = next.startsWith('#') ? next : `#${next}`;
              setHsv(hexToHsv(norm));
              onChange(norm);
            }
          }}
          onBlur={() => setHexInput(hsvToHex(hsv).toUpperCase())}
          className="h-6 flex-1 rounded border border-border bg-bg px-2 font-mono text-[11px] uppercase text-fg outline-none focus:border-accent/50"
        />
      </div>
    </div>
  );
}

function SVPad({
  hsv,
  hueColor,
  onChange
}: {
  hsv: HSV;
  hueColor: string;
  onChange: (s: number, v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const updateFromEvent = (e: PointerEvent | React.PointerEvent): void => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    onChange(x, 1 - y);
  };

  const onPointerDown = (e: React.PointerEvent): void => {
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromEvent(e);
    const move = (ev: PointerEvent): void => updateFromEvent(ev);
    const up = (): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className="relative h-[140px] w-full cursor-crosshair overflow-hidden rounded border border-border"
      style={{ background: hueColor }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to right, #fff, transparent)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, #000, transparent)' }}
      />
      <div
        className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
        style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
      />
    </div>
  );
}

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const updateFromEvent = (e: PointerEvent | React.PointerEvent): void => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    onChange(x * 360);
  };

  const onPointerDown = (e: React.PointerEvent): void => {
    (e.target as Element).setPointerCapture(e.pointerId);
    updateFromEvent(e);
    const move = (ev: PointerEvent): void => updateFromEvent(ev);
    const up = (): void => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className="relative h-3 w-full cursor-pointer overflow-hidden rounded-full border border-border"
      style={{
        background:
          'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
      }}
    >
      <div
        className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
        style={{
          left: `${(hue / 360) * 100}%`,
          background: `hsl(${hue} 100% 50%)`
        }}
      />
    </div>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
