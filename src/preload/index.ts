import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { CaretApi, WorkspaceStore } from '../shared/types';

const api: CaretApi = {
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    toggleMaximize: () => ipcRenderer.invoke('window:toggleMaximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
    onMaximizeChange: (cb) => {
      const listener = (_e: IpcRendererEvent, value: boolean): void => cb(value);
      ipcRenderer.on('window:maximizeChange', listener);
      return () => ipcRenderer.off('window:maximizeChange', listener);
    }
  },
  dialog: {
    openFolder: () => ipcRenderer.invoke('dialog:openFolder')
  },
  fs: {
    readDir: (path) => ipcRenderer.invoke('fs:readDir', path),
    listFiles: (path) => ipcRenderer.invoke('fs:listFiles', path),
    readFile: (path) => ipcRenderer.invoke('fs:readFile', path),
    readBase64: (path) => ipcRenderer.invoke('fs:readBase64', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:writeFile', path, content),
    createFile: (path) => ipcRenderer.invoke('fs:createFile', path),
    createFolder: (path) => ipcRenderer.invoke('fs:createFolder', path),
    rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
    delete: (path) => ipcRenderer.invoke('fs:delete', path),
    searchInFiles: (root, options) => ipcRenderer.invoke('fs:searchInFiles', root, options),
    replaceInFiles: (targets, options, replacement) =>
      ipcRenderer.invoke('fs:replaceInFiles', targets, options, replacement)
  },
  store: {
    get: () => ipcRenderer.invoke('store:get'),
    set: (data: WorkspaceStore) => ipcRenderer.invoke('store:set', data)
  }
};

contextBridge.exposeInMainWorld('caret', api);
