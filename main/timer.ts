import { app, globalShortcut, ipcMain, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

const ElectronConfig = require('electron-config');

let mainWindow: Electron.BrowserWindow | null;
let barWindow: Electron.BrowserWindow | null;
let oIntervalTimer: NodeJS.Timer | null;
let cycle = 0;

let oConfig = new ElectronConfig({
    defaults: {
        progressbar: {
            show: true,
            draggable: true,
            x: 0,
            y: 0
        }
    }
});

const mainWindowSend = (channel: string, ...args: any[]) => {
    if (!mainWindow) return;
    mainWindow.webContents.send(channel, ...args);
};

const barWindowSend = (channel: string, ...args: any[]) => {
    if (!barWindow) return;
    barWindow.webContents.send(channel, ...args);
};

// timer init
export const init = (win: Electron.BrowserWindow) => {

    mainWindow = win;

    mainWindow.on('close', stop);
    app.on('will-quit', () => globalShortcut.unregisterAll());
    ipcMain.on('reset', reset);
    ipcMain.on('start', start);
    ipcMain.on('stop', stop);
    ipcMain.on('getConfig', (e, key) => e.returnValue = getConfig(key));
    ipcMain.on('setConfig', (event, key, value) => setConfig(key, value));
    ipcMain.on('createBar', createBar);

    globalShortcut.register('CommandOrControl+1', start);
    globalShortcut.register('CommandOrControl+2', stop);

};

export const reset = () => cycle = 0;

export const getConfig = (key: string) => oConfig.get(key);

export const setConfig = (key: string, value: any) => {
    oConfig.set(key, value);
    mainWindowSend('affectConfig');
};

export const increase = () => {
    mainWindowSend('timer-notify', cycle);
    barWindowSend('timer-notify', cycle);
    cycle++;
};

export const start = () => {

    // clear previous interval
    if (oIntervalTimer) return reset();

    // set interval
    oIntervalTimer = setInterval(increase, 1000);

    increase();

    createBar();

};

export const stop = () => {
    mainWindowSend('timer-stop');
    reset();
    oIntervalTimer && clearInterval(oIntervalTimer);
    oIntervalTimer = null;
    removeBar();
};

export const createBar = () => {

    removeBar();

    const conf = getConfig('progressbar');

    if (!oIntervalTimer) return;
    if (!conf.show) return;

    const option = {
        width: 38, height: 38,
        center: true,
        resizable: false,
        frame: false, alwaysOnTop: true, maximizable: false, minimizable: false, hasShadow: false, skipTaskbar: true, focusable: false
    };

    if (+conf.x || +conf.y) {
        option['x'] = conf.x;
        option['y'] = conf.y;
    }

    // Create the renderer window.
    barWindow = new BrowserWindow(option);

    // and load the index.html of the app.
    barWindow.loadURL(url.format({
        pathname: path.join(__dirname, '../barWindow/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    barWindow.on('closed', () => {
        barWindow = null;
    });

    let moveTimer: NodeJS.Timer | null;

    barWindow.on('move', () => {
        moveTimer && clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
            if (!barWindow) return;
            const p = barWindow.getPosition();
            setConfig('progressbar.x', p[0]);
            setConfig('progressbar.y', p[1]);
            moveTimer = null;
        }, 300);
    });

    //barWindow.webContents.openDevTools();

};

export const removeBar = () => {

    barWindow && barWindow.close();

};