import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { ACCENT_PRESETS, type Settings } from '../lib/settings';
import { ColorPicker } from './ColorPicker';
import logo from '../assets/caret-logo.png';

type Props = {
  open: boolean;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onReset: () => void;
  onClose: () => void;
};

export function SettingsModal({ open, settings, onChange, onReset, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settings"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 6, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[540px] max-w-[88vw] overflow-hidden rounded-lg border border-border bg-panel shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <img src={logo} alt="" draggable={false} className="h-4 w-4 select-none" />
                <h2 className="text-sm font-medium text-fg">Settings</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onReset}
                  aria-label="Reset to defaults"
                  className="flex h-6 items-center gap-1.5 rounded px-2 text-[11px] text-muted transition-colors hover:bg-elevated hover:text-fg"
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close settings"
                  className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:bg-elevated hover:text-fg"
                >
                  <X size={13} />
                </button>
              </div>
            </header>

            <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-5">
              <Section title="Accent">
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => onChange({ accent: p.value })}
                      aria-label={p.name}
                      title={p.name}
                      className={`relative h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
                        settings.accent.toLowerCase() === p.value.toLowerCase()
                          ? 'border-fg'
                          : 'border-border'
                      }`}
                      style={{ background: p.value }}
                    />
                  ))}
                  <div className="ml-1">
                    <ColorPicker value={settings.accent} onChange={(v) => onChange({ accent: v })} />
                  </div>
                </div>
              </Section>

              <Section title="Background">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <ColorPicker value={settings.bg} onChange={(v) => onChange({ bg: v })} />
                    <span className="text-[11px] text-muted">page</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ColorPicker value={settings.panel} onChange={(v) => onChange({ panel: v })} />
                    <span className="text-[11px] text-muted">panel</span>
                  </div>
                </div>
              </Section>

              <Section title="Editor">
                <Slider
                  label="Font size"
                  min={10}
                  max={22}
                  value={settings.fontSizeEditor}
                  onChange={(v) => onChange({ fontSizeEditor: v })}
                />
                <Slider
                  label="Tab size"
                  min={2}
                  max={8}
                  step={2}
                  value={settings.tabSize}
                  onChange={(v) => onChange({ tabSize: v })}
                />
                <Toggle
                  label="Word wrap"
                  value={settings.wordWrap}
                  onChange={(v) => onChange({ wordWrap: v })}
                />
                <Toggle
                  label="Minimap"
                  value={settings.minimap}
                  onChange={(v) => onChange({ minimap: v })}
                />
                <Toggle
                  label="Line numbers"
                  value={settings.lineNumbers}
                  onChange={(v) => onChange({ lineNumbers: v })}
                />
                <Toggle
                  label="Tint cursor by language"
                  value={settings.cursorTint}
                  onChange={(v) => onChange({ cursorTint: v })}
                />
              </Section>

              <Section title="Atmosphere">
                <Toggle
                  label="Ambient particles in the editor"
                  value={settings.ambient}
                  onChange={(v) => onChange({ ambient: v })}
                />
              </Section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-wider text-muted">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-28 shrink-0 text-xs text-fg/80">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="caret-range flex-1"
      />
      <span className="w-6 text-right font-mono text-xs text-fg">{value}</span>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded px-1 py-1 text-xs text-fg/80 transition-colors hover:bg-elevated"
    >
      <span>{label}</span>
      <span
        className="relative h-[18px] w-[34px] shrink-0 rounded-full border transition-colors"
        style={{
          background: value ? 'var(--caret-accent)' : '#26262b',
          borderColor: value ? 'transparent' : '#1f1f23'
        }}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 32 }}
          className="absolute top-[2px] h-[12px] w-[12px] rounded-full bg-white shadow"
          style={{ [value ? 'right' : 'left']: 2 }}
        />
      </span>
    </button>
  );
}
