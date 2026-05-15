export function joinPath(dir: string, name: string): string {
  const sep = pickSep(dir);
  const trimmed = dir.replace(/[\\/]+$/, '');
  return `${trimmed}${sep}${name}`;
}

export function parentOf(path: string): string {
  const idx = lastSepIndex(path);
  if (idx <= 0) return path;
  return path.slice(0, idx);
}

export function replaceName(path: string, newName: string): string {
  const idx = lastSepIndex(path);
  if (idx === -1) return newName;
  return path.slice(0, idx + 1) + newName;
}

export function basename(path: string): string {
  const idx = lastSepIndex(path);
  return idx === -1 ? path : path.slice(idx + 1);
}

function pickSep(path: string): string {
  return path.includes('\\') ? '\\' : '/';
}

function lastSepIndex(path: string): number {
  return Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
}
