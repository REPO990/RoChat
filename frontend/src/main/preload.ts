import { contextBridge, ipcRenderer } from 'electron';

// Expose safe methods to renderer
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('set-always-on-top', flag),
  setOpacity: (opacity: number) => ipcRenderer.send('set-opacity', opacity),
  minimize: () => ipcRenderer.send('minimize'),
  close: () => ipcRenderer.send('close'),
  resizeTo: (width: number, height: number) => ipcRenderer.send('resize-to', width, height),
  onOAuthCallback: (callback: (tokens: { accessToken: string; refreshToken: string }) => void) => {
    ipcRenderer.on('oauth-callback', (event, tokens) => callback(tokens));
  },
  openExternal: (url: string) => ipcRenderer.send('open-external', url),
});