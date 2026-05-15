import { BrowserWindow, nativeImage, shell } from 'electron';
import { join } from 'node:path';

const ICON_CANDIDATES = [
  join(__dirname, '../../src/main/icon.png'),
  join(__dirname, '../../build/icon.png'),
  join(process.resourcesPath ?? '', 'icon.png')
];

function loadIcon(): Electron.NativeImage | undefined {
  for (const path of ICON_CANDIDATES) {
    if (!path) continue;
    const img = nativeImage.createFromPath(path);
    if (!img.isEmpty()) return img;
  }
  return undefined;
}

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 720,
    minHeight: 480,
    frame: false,
    backgroundColor: '#0a0a0b',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 14, y: 14 },
    icon: loadIcon(),
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.once('ready-to-show', () => win.show());
  win.on('maximize', () => win.webContents.send('window:maximizeChange', true));
  win.on('unmaximize', () => win.webContents.send('window:maximizeChange', false));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const devUrl = process.env['ELECTRON_RENDERER_URL'];
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return win;
}
