export type HSV = { h: number; s: number; v: number };

export function hexToHsv(hex: string): HSV {
  const v = normalizeHex(hex);
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  return rgbToHsv(r, g, b);
}

export function hsvToHex({ h, s, v }: HSV): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60)        { r = c; g = x; b = 0; }
  else if (h < 120)  { r = x; g = c; b = 0; }
  else if (h < 180)  { r = 0; g = c; b = x; }
  else if (h < 240)  { r = 0; g = x; b = c; }
  else if (h < 300)  { r = x; g = 0; b = c; }
  else               { r = c; g = 0; b = x; }
  return { r: r + m, g: g + m, b: b + m };
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n * 255))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function normalizeHex(hex: string): string {
  let v = hex.replace('#', '').trim();
  if (v.length === 3) v = v.split('').map((c) => c + c).join('');
  if (v.length !== 6) return '000000';
  return v.toLowerCase();
}

export function isValidHex(hex: string): boolean {
  const v = hex.replace('#', '').trim();
  return /^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(v);
}
