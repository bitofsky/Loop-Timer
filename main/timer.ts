import { ipcMain } from 'electron';
import { initShortcut, affectShortcut } from './timer.shortcut';
import { createProgressbar, removeProgressbar, sendProgressbar } from './timer.progressbar';

const ElectronConfig = require('electron-config');

let mainWindow: Electron.BrowserWindow | null;
let oIntervalTimer: NodeJS.Timer | null;
let cycle = 0;

export const sendMainWindow = (channel: string, ...args: any[]) => {
    if (!mainWindow) return;
    mainWindow.webContents.send(channel, ...args);
};

// timer init
export const init = (win: Electron.BrowserWindow) => {

    mainWindow = win;

    mainWindow.on('close', stop);

    ipcMain.on('reset', reset);
    ipcMain.on('start', start);
    ipcMain.on('stop', stop);
    ipcMain.on('getConfig', (e, key) => e.returnValue = getConfig(key));
    ipcMain.on('setConfig', (event, key, value) => setConfig(key, value));
    ipcMain.on('createProgressbar', createProgressbar);

    initShortcut();

};

export const reset = () => cycle = 0;

export const getConfig = (key: string) => Config.get(key);

export const setConfig = (key: string, value: any) => {
    Config.set(key, value);
    sendMainWindow('affectConfig');
    key.includes('shortcut') && affectShortcut();
};

export const increase = () => {
    sendMainWindow('timerNotify', cycle);
    sendProgressbar('timerNotify', cycle);
    cycle++;
};

export const start = () => {

    // clear previous interval
    if (oIntervalTimer) return reset();

    // set interval
    oIntervalTimer = setInterval(increase, 1000);

    increase();

    createProgressbar();

};

export const stop = () => {
    sendMainWindow('timerStop');
    reset();
    oIntervalTimer && clearInterval(oIntervalTimer);
    oIntervalTimer = null;
    removeProgressbar();
};

export const isActive = () => !!oIntervalTimer;

export const Config = new ElectronConfig({
    defaults: {
        progressbar: {
            show: true,
            draggable: true,
            x: 0,
            y: 0
        },
        shortcut: {
            start: {
                prefix: 'CmdOrCtrl',
                key: '1'
            },
            stop: {
                prefix: 'CmdOrCtrl',
                key: '2'
            }
        }
    }
});

export const ShortcutEvents = { start, stop };
