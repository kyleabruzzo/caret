import { app } from 'electron';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { WorkspaceStore } from '../shared/types';

const file = (): string => join(app.getPath('userData'), 'caret-store.json');

export function read(): WorkspaceStore {
  const path = file();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as WorkspaceStore;
  } catch {
    return {};
  }
}

export function write(data: WorkspaceStore): void {
  writeFileSync(file(), JSON.stringify(data, null, 2), 'utf8');
}
