/**
 * 메인 윈도우 생성 및 관리
 */
import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { init } from './timer';

// 개발 모드 체크
const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);

let win: Electron.BrowserWindow | null;

/**
 * Create Electron Main Window
 */
export const createWindow = () => {

    if (win) return;

    // Create the renderer window.
    win = new BrowserWindow({ width: 400, height: 700, frame: false, minWidth: 400, resizable: false, maximizable: false });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, '../renderer/tpl/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    win.on('closed', () => {
        win = null;
    });

    isDev && isDevInit(win);

    init(win);
};

const setWindowTop = (win: Electron.BrowserWindow) => {
    if (win.isFocused()) return;
    win.focus();
    win.setAlwaysOnTop(true);
    win.setAlwaysOnTop(false);
    win.blur();
};

const isDevInit = (win: Electron.BrowserWindow) => {
    ipcStart();
    // win.webContents.openDevTools();
};

const ipcStart = () => {

    const ipc = require('node-ipc');
    ipc.config.appspace = require('../package.json').ipc.appspace;
    ipc.config.id = require('../package.json').ipc.id;
    ipc.config.silent = true;
    ipc.serve(() => {
        console.error(`Electron AutoReload : IPC ready : ${ipc.server.path}`);
        ipc.server.on('message', async (data: string, socket: any) => { // reload
            //win && data === 'tsc:build' && win.webContents.reload();
            if (win && data === 'tsc:build') {
                await win.webContents.reloadIgnoringCache();
                console.log('Electron win.webContents.reload()');
                setWindowTop(win);
            }
        });
    });
    ipc.server.start();

};
