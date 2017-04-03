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

    oIntervalTimer && stop();
    oIntervalTimer = setInterval(increase, 1000);

    increase();
    createProgressbar();

};

export const stop = () => {
    sendMainWindow('timerStop');
    reset();
    clearLoop();
    removeProgressbar();
};

export const clearLoop = () => {
    oIntervalTimer && clearInterval(oIntervalTimer);
    oIntervalTimer = null;
}

export const isActive = () => !!oIntervalTimer;

const defaults = {
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
};

export const Config = new ElectronConfig({ defaults });

// 추가된 config 셋팅은 아래와 같은 형태로 셀프 추가 해야, 기존 버전 config가 함께 mix 된다.
// !Config.get('shortcut.pause') && Config.set('shortcut.pause', defaults.shortcut.pause);

export const ShortcutEvents = { start, stop };
