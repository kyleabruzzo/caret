import { BrowserWindow, dialog, ipcMain } from 'electron';
import type { IpcMainInvokeEvent } from 'electron';
import { promises as fs } from 'node:fs';
import { extname, join } from 'node:path';
import type {
  ReplaceTarget,
  SearchFileResult,
  SearchHit,
  SearchOptions,
  TreeNode,
  WorkspaceStore
} from '../shared/types';
import { read as storeRead, write as storeWrite } from './store';

const IGNORE = new Set(['node_modules', '.git', '.DS_Store', 'dist', 'out', 'release']);
const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.bmp', '.ico', '.apng', '.tiff', '.tif',
  '.pdf', '.zip', '.tar', '.gz', '.7z', '.exe', '.dll', '.so', '.dylib',
  '.mp3', '.mp4', '.mov', '.avi', '.webm', '.mkv', '.wav', '.flac', '.ogg',
  '.ttf', '.otf', '.woff', '.woff2', '.eot'
]);

const MAX_RESULTS_PER_FILE = 100;
const MAX_FILES_SCANNED = 5000;
const MAX_FILE_BYTES = 1_500_000;

const senderWindow = (event: IpcMainInvokeEvent): BrowserWindow | null =>
  BrowserWindow.fromWebContents(event.sender);

export function registerIpc(): void {
  ipcMain.handle('window:minimize', (e) => senderWindow(e)?.minimize());
  ipcMain.handle('window:toggleMaximize', (e) => {
    const win = senderWindow(e);
    if (!win) return false;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
    return win.isMaximized();
  });
  ipcMain.handle('window:close', (e) => senderWindow(e)?.close());
  ipcMain.handle('window:isMaximized', (e) => senderWindow(e)?.isMaximized() ?? false);

  ipcMain.handle('dialog:openFolder', async (e) => {
    const win = senderWindow(e);
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('fs:readDir', (_e, path: string) => readDirOneLevel(path));
  ipcMain.handle('fs:listFiles', (_e, path: string) => listFilesRecursive(path));
  ipcMain.handle('fs:readFile', (_e, path: string) => fs.readFile(path, 'utf8'));
  ipcMain.handle('fs:readBase64', (_e, path: string) => readAsDataUrl(path));
  ipcMain.handle('fs:writeFile', (_e, path: string, content: string) =>
    fs.writeFile(path, content, 'utf8')
  );
  ipcMain.handle('fs:createFile', (_e, path: string) => fs.writeFile(path, '', { flag: 'wx' }));
  ipcMain.handle('fs:createFolder', (_e, path: string) => fs.mkdir(path));
  ipcMain.handle('fs:rename', (_e, oldPath: string, newPath: string) =>
    fs.rename(oldPath, newPath)
  );
  ipcMain.handle('fs:delete', (_e, path: string) => fs.rm(path, { recursive: true, force: true }));
  ipcMain.handle('fs:searchInFiles', (_e, root: string, options: SearchOptions) =>
    searchInFiles(root, options)
  );
  ipcMain.handle(
    'fs:replaceInFiles',
    (_e, targets: ReplaceTarget[], options: SearchOptions, replacement: string) =>
      replaceInFiles(targets, options, replacement)
  );

  ipcMain.handle('store:get', () => storeRead());
  ipcMain.handle('store:set', (_e, data: WorkspaceStore) => storeWrite(data));
}

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.apng': 'image/apng',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff'
};

async function readAsDataUrl(path: string): Promise<string> {
  const buf = await fs.readFile(path);
  const mime = MIME[extname(path).toLowerCase()] ?? 'application/octet-stream';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function listFilesRecursive(root: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORE.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.isFile()) out.push(path);
      if (out.length >= MAX_FILES_SCANNED) return;
    }
  };
  await walk(root);
  return out;
}

async function readDirOneLevel(dir: string): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nodes: TreeNode[] = [];
  for (const entry of entries) {
    if (IGNORE.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      nodes.push({ type: 'directory', name: entry.name, path, children: null });
    } else if (entry.isFile()) {
      nodes.push({ type: 'file', name: entry.name, path });
    }
  }
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return nodes;
}

function buildRegex(options: SearchOptions): RegExp | null {
  if (!options.query) return null;
  const flags = options.caseSensitive ? 'gm' : 'gmi';
  let source: string;
  if (options.regex) {
    source = options.query;
  } else {
    source = options.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  if (options.wholeWord) source = `\\b${source}\\b`;
  try {
    return new RegExp(source, flags);
  } catch {
    return null;
  }
}

async function searchInFiles(root: string, options: SearchOptions): Promise<SearchFileResult[]> {
  const re = buildRegex(options);
  if (!re) return [];

  const files = await listFilesRecursive(root);
  const results: SearchFileResult[] = [];

  for (const path of files) {
    if (BINARY_EXTS.has(extname(path).toLowerCase())) continue;
    let stat;
    try {
      stat = await fs.stat(path);
    } catch {
      continue;
    }
    if (stat.size > MAX_FILE_BYTES) continue;

    let content: string;
    try {
      content = await fs.readFile(path, 'utf8');
    } catch {
      continue;
    }

    const hits: SearchHit[] = [];
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineRe = new RegExp(re.source, re.flags);
      let m: RegExpExecArray | null;
      while ((m = lineRe.exec(line)) !== null) {
        hits.push({
          line: i + 1,
          column: m.index + 1,
          length: m[0].length,
          preview: line
        });
        if (hits.length >= MAX_RESULTS_PER_FILE) break;
        if (m.index === lineRe.lastIndex) lineRe.lastIndex++;
      }
      if (hits.length >= MAX_RESULTS_PER_FILE) break;
    }

    if (hits.length > 0) results.push({ path, hits });
  }

  return results;
}

async function replaceInFiles(
  targets: ReplaceTarget[],
  options: SearchOptions,
  replacement: string
): Promise<number> {
  const re = buildRegex(options);
  if (!re) return 0;

  let total = 0;
  for (const target of targets) {
    let content: string;
    try {
      content = await fs.readFile(target.path, 'utf8');
    } catch {
      continue;
    }

    const lineRe = new RegExp(re.source, re.flags);
    const updated = content.replace(lineRe, (...args) => {
      const match = args[0] as string;
      const groups = args.slice(1, -2) as string[];
      total += 1;
      if (options.regex) {
        return replacement.replace(/\$(\d+)/g, (_full, n) => groups[Number(n) - 1] ?? '');
      }
      return replacement.length === 0 ? '' : replacement || match;
    });

    if (updated !== content) {
      try {
        await fs.writeFile(target.path, updated, 'utf8');
      } catch {
        // skip writes that fail
      }
    }
  }
  return total;
}
