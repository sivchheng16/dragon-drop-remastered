import { app, BrowserWindow } from 'electron'
import path from 'node:path'

// The built directory structure
//
// ├─┬─ dist
// │ ├─index.html
// │ ├─index.html
// │ ├─ ...
// ├─┬─ dist-electron
// │ ├── main.js
// │ ├── preload.js
//

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC as string, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
        },
        fullscreen: true, // Kiosk mode by default
        autoHideMenuBar: true,
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST as string, 'index.html'))
    }
}

// IPC Handlers
import { ipcMain } from 'electron'

app.whenReady().then(() => {
    ipcMain.handle('app:quit', () => app.quit());
    ipcMain.handle('app:minimize', () => BrowserWindow.getFocusedWindow()?.minimize());
    ipcMain.handle('app:get-version', () => app.getVersion());

    createWindow();
});
