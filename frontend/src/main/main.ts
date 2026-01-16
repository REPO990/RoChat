import { app, BrowserWindow, ipcMain, globalShortcut, session, shell } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 550,
    frame: false,
    transparent: true,
    alwaysOnTop: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Get the default session for the main window
  const mainSession = mainWindow.webContents.session;

  // Ignore certificate errors for development (to fix SSL handshake error)
  mainSession.setCertificateVerifyProc((request, callback) => {
    callback(0); // 0 means "success, allow the connection"
  });

  // Add event listeners for debugging crashes
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed!');
    // Optional: reload the window or show an error message
  });
// Intercept requests to open new windows (like OAuth popups)
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  // Open ALL external URLs in the system's default browser
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Use the shell module to open in the default browser
    shell.openExternal(url);
    // Return action: 'deny' tells Electron NOT to open its own window
    return { action: 'deny' };
  }
  // Allow other types of windows if needed (very rare for your app)
  return { action: 'allow' };
});
  mainWindow.loadURL('http://localhost:3000');
  
  // Keep DevTools open for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
// Direct test in the main process

setTimeout(() => {
    console.log('Test: Opening Google in default browser...');
    try {
        const success = shell.openExternal('mailto:test@google.com');
        console.log('openExternal() called. Returned:', success);
    } catch (error) {
        console.error('openExternal() threw an error:', error);
    }
}, 3000);
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.on('set-always-on-top', (event, flag: boolean) => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(flag);
  }
});

ipcMain.on('set-opacity', (event, opacity: number) => {
  if (mainWindow) {
    mainWindow.setOpacity(opacity);
  }
});

ipcMain.on('minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('resize-to', (event, width: number, height: number) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
  }
});
