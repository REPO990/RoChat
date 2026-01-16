import { app, BrowserWindow, ipcMain, globalShortcut, session, shell, Event, IpcMainEvent } from 'electron';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// ========== ESSENTIAL WINSTON LOGGER SETUP ==========
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [${level}]: ${message} ${metaStr}`.trim();
        })
      )
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/main-process-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat
    })
  ]
});

logger.info('Main process starting...');

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  logger.info('Creating main browser window');
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

  // Fix SSL errors in development
  const mainSession = mainWindow.webContents.session;
  mainSession.setCertificateVerifyProc((request, callback) => {
    callback(0);
  });

  // ========== CRITICAL FIX: Force ALL external links to open in default browser ==========
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    logger.debug('External link clicked', { url });
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      logger.info('Opening external URL in default browser', { url });
      shell.openExternal(url);
      return { action: 'deny' };
    }
    
    return { action: 'allow' };
  });

  // Extra safety: Catch navigation attempts
  mainWindow.webContents.on('will-navigate', (event: Event, url: string) => {
    if (!url.startsWith('http://localhost:3000') && 
        !url.startsWith('file://') && 
        (url.startsWith('http://') || url.startsWith('https://'))) {
      logger.info('Blocking external navigation', { url });
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL('http://localhost:3000');
  
  // Only open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    logger.info('Main window closed');
    mainWindow = null;
  });
}
// Function to handle custom protocol URLs
function handleCustomProtocolUrl(url: string) {
  logger.info('Handling custom protocol URL', { url });
  
  try {
    // Parse URL like robloxchat://auth?accessToken=...&refreshToken=...
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    
    if (accessToken && refreshToken) {
      logger.info('Tokens extracted from custom URL');
      
      // Send tokens to renderer
      if (mainWindow) {
        mainWindow.webContents.send('oauth-callback', { accessToken, refreshToken });
      }
    }
  } catch (error: any) {
    logger.error('Failed to parse custom URL', { error: error.message, url });
  }
}
app.whenReady().then(() => {
  app.whenReady().then(() => {
  // ========== REGISTER CUSTOM PROTOCOL ==========
  // This tells Electron to handle robloxchat:// URLs
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('robloxchat', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('robloxchat');
  }
  
  // Handle when app is opened with robloxchat:// URL
  app.on('open-url', (event, url) => {
    event.preventDefault();
    logger.info('App opened with custom URL', { url });
    handleCustomProtocolUrl(url);
  });
  
  // Handle protocol URL on Windows (when app is already running)
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    logger.info('Second instance attempted', { commandLine });
    
    // Find the protocol URL in command line arguments
    const protocolUrl = commandLine.find(arg => arg.startsWith('robloxchat://'));
    if (protocolUrl) {
      logger.info('Found protocol URL in second instance', { protocolUrl });
      handleCustomProtocolUrl(protocolUrl);
    }
    
    // Focus the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  
  // Single instance lock (Windows)
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    logger.warn('Another instance is running, quitting...');
    app.quit();
    return;
  }
  
  // ... rest of your code (createWindow, etc.)
});

// Function to handle custom protocol URLs
function handleCustomProtocolUrl(url: string) {
  logger.info('Handling custom protocol URL', { url });
  
  try {
    // Parse URL like robloxchat://auth?accessToken=...&refreshToken=...
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    
    if (accessToken && refreshToken) {
      logger.info('Tokens extracted from custom URL');
      
      // Send tokens to renderer
      if (mainWindow) {
        mainWindow.webContents.send('oauth-callback', { accessToken, refreshToken });
      } else {
        // Window doesn't exist yet, store tokens for when it's created
        pendingOAuthTokens = { accessToken, refreshToken };
      }
    }
  } catch (error: any) {
    logger.error('Failed to parse custom URL', { error: error.message, url });
  }
}

let pendingOAuthTokens: { accessToken: string; refreshToken: string } | null = null;
  logger.info('Electron app is ready');
  createWindow();

  // Global shortcut for toggling window
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
        logger.debug('Window hidden via shortcut');
      } else {
        mainWindow.show();
        logger.debug('Window shown via shortcut');
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
  logger.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// ========== ESSENTIAL IPC HANDLERS ==========
ipcMain.on('set-always-on-top', (event: IpcMainEvent, flag: boolean) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(flag);
});

ipcMain.on('set-opacity', (event: IpcMainEvent, opacity: number) => {
  if (mainWindow) mainWindow.setOpacity(opacity);
});

ipcMain.on('minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('resize-to', (event: IpcMainEvent, width: number, height: number) => {
  if (mainWindow) mainWindow.setSize(width, height);
});

ipcMain.on('open-external', (event: IpcMainEvent, url: string) => {
  logger.info('Opening external URL from renderer', { url });
  shell.openExternal(url);
});