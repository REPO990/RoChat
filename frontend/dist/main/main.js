"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
// ========== ESSENTIAL WINSTON LOGGER SETUP ==========
const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json());
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `${timestamp} [${level}]: ${message} ${metaStr}`.trim();
            }))
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
let mainWindow = null;
function createWindow() {
    logger.info('Creating main browser window');
    mainWindow = new electron_1.BrowserWindow({
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
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
    // Extra safety: Catch navigation attempts
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('http://localhost:3000') &&
            !url.startsWith('file://') &&
            (url.startsWith('http://') || url.startsWith('https://'))) {
            logger.info('Blocking external navigation', { url });
            event.preventDefault();
            electron_1.shell.openExternal(url);
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
function handleCustomProtocolUrl(url) {
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
    }
    catch (error) {
        logger.error('Failed to parse custom URL', { error: error.message, url });
    }
}
electron_1.app.whenReady().then(() => {
    electron_1.app.whenReady().then(() => {
        // ========== REGISTER CUSTOM PROTOCOL ==========
        // This tells Electron to handle robloxchat:// URLs
        if (process.defaultApp) {
            if (process.argv.length >= 2) {
                electron_1.app.setAsDefaultProtocolClient('robloxchat', process.execPath, [path.resolve(process.argv[1])]);
            }
        }
        else {
            electron_1.app.setAsDefaultProtocolClient('robloxchat');
        }
        // Handle when app is opened with robloxchat:// URL
        electron_1.app.on('open-url', (event, url) => {
            event.preventDefault();
            logger.info('App opened with custom URL', { url });
            handleCustomProtocolUrl(url);
        });
        // Handle protocol URL on Windows (when app is already running)
        electron_1.app.on('second-instance', (event, commandLine, workingDirectory) => {
            logger.info('Second instance attempted', { commandLine });
            // Find the protocol URL in command line arguments
            const protocolUrl = commandLine.find(arg => arg.startsWith('robloxchat://'));
            if (protocolUrl) {
                logger.info('Found protocol URL in second instance', { protocolUrl });
                handleCustomProtocolUrl(protocolUrl);
            }
            // Focus the existing window
            if (mainWindow) {
                if (mainWindow.isMinimized())
                    mainWindow.restore();
                mainWindow.focus();
            }
        });
        // Single instance lock (Windows)
        const gotTheLock = electron_1.app.requestSingleInstanceLock();
        if (!gotTheLock) {
            logger.warn('Another instance is running, quitting...');
            electron_1.app.quit();
            return;
        }
        // ... rest of your code (createWindow, etc.)
    });
    // Function to handle custom protocol URLs
    function handleCustomProtocolUrl(url) {
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
                else {
                    // Window doesn't exist yet, store tokens for when it's created
                    pendingOAuthTokens = { accessToken, refreshToken };
                }
            }
        }
        catch (error) {
            logger.error('Failed to parse custom URL', { error: error.message, url });
        }
    }
    let pendingOAuthTokens = null;
    logger.info('Electron app is ready');
    createWindow();
    // Global shortcut for toggling window
    electron_1.globalShortcut.register('CommandOrControl+Shift+C', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
                logger.debug('Window hidden via shortcut');
            }
            else {
                mainWindow.show();
                logger.debug('Window shown via shortcut');
            }
        }
    });
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    logger.info('All windows closed');
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
});
// ========== ESSENTIAL IPC HANDLERS ==========
electron_1.ipcMain.on('set-always-on-top', (event, flag) => {
    if (mainWindow)
        mainWindow.setAlwaysOnTop(flag);
});
electron_1.ipcMain.on('set-opacity', (event, opacity) => {
    if (mainWindow)
        mainWindow.setOpacity(opacity);
});
electron_1.ipcMain.on('minimize', () => {
    if (mainWindow)
        mainWindow.minimize();
});
electron_1.ipcMain.on('close', () => {
    if (mainWindow)
        mainWindow.close();
});
electron_1.ipcMain.on('resize-to', (event, width, height) => {
    if (mainWindow)
        mainWindow.setSize(width, height);
});
electron_1.ipcMain.on('open-external', (event, url) => {
    logger.info('Opening external URL from renderer', { url });
    electron_1.shell.openExternal(url);
});
