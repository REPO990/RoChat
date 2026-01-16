"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe methods to renderer
electron_1.contextBridge.exposeInMainWorld('electron', {
    // Window controls
    setAlwaysOnTop: (flag) => electron_1.ipcRenderer.send('set-always-on-top', flag),
    setOpacity: (opacity) => electron_1.ipcRenderer.send('set-opacity', opacity),
    minimize: () => electron_1.ipcRenderer.send('minimize'),
    close: () => electron_1.ipcRenderer.send('close'),
    resizeTo: (width, height) => electron_1.ipcRenderer.send('resize-to', width, height),
    onOAuthCallback: (callback) => {
        electron_1.ipcRenderer.on('oauth-callback', (event, tokens) => callback(tokens));
    },
    openExternal: (url) => electron_1.ipcRenderer.send('open-external', url),
});
