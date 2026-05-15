export type Settings = {
  accent: string;
  bg: string;
  panel: string;
  fontSizeEditor: number;
  fontFamilyMono: string;
  fontFamilySans: string;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  ambient: boolean;
  cursorTint: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  accent: '#7dd3da',
  bg: '#0a0a0b',
  panel: '#101012',
  fontSizeEditor: 13,
  fontFamilyMono: '"JetBrains Mono", ui-monospace, monospace',
  fontFamilySans: '"Manrope", system-ui, sans-serif',
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  ambient: true,
  cursorTint: true
};

export const ACCENT_PRESETS: readonly { name: string; value: string }[] = [
  { name: 'Teal',   value: '#7dd3da' },
  { name: 'Blue',   value: '#7aa2f7' },
  { name: 'Violet', value: '#a288e3' },
  { name: 'Mint',   value: '#5dc9a8' },
  { name: 'Coral',  value: '#e07b5a' },
  { name: 'Gold',   value: '#f1d96d' },
  { name: 'Pink',   value: '#e7659f' },
  { name: 'Slate',  value: '#8b9bb4' }
];

export function mergeSettings(stored: Partial<Settings> | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}
