import { contextBridge, ipcRenderer, shell } from 'electron';

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electron', {
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('set-always-on-top', flag),
  setOpacity: (opacity: number) => ipcRenderer.send('set-opacity', opacity),
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
  resizeTo: (width: number, height: number) => ipcRenderer.send('resize-to', width, height),
  // NEW FUNCTION: Open URL in default browser
  openExternal: (url: string) => shell.openExternal(url),
});