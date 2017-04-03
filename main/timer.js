"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const timer_shortcut_1 = require("./timer.shortcut");
const timer_progressbar_1 = require("./timer.progressbar");
const ElectronConfig = require('electron-config');
let mainWindow;
let oIntervalTimer;
let cycle = 0;
exports.Config = new ElectronConfig({
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
const sendMainWindow = (channel, ...args) => {
    if (!mainWindow)
        return;
    mainWindow.webContents.send(channel, ...args);
};
// timer init
exports.init = (win) => {
    mainWindow = win;
    mainWindow.on('close', exports.stop);
    electron_1.ipcMain.on('reset', exports.reset);
    electron_1.ipcMain.on('start', exports.start);
    electron_1.ipcMain.on('stop', exports.stop);
    electron_1.ipcMain.on('getConfig', (e, key) => e.returnValue = exports.getConfig(key));
    electron_1.ipcMain.on('setConfig', (event, key, value) => exports.setConfig(key, value));
    electron_1.ipcMain.on('createProgressbar', timer_progressbar_1.createProgressbar);
    timer_shortcut_1.initShortcut();
};
exports.reset = () => cycle = 0;
exports.getConfig = (key) => exports.Config.get(key);
exports.setConfig = (key, value) => {
    exports.Config.set(key, value);
    sendMainWindow('affectConfig');
    key.includes('shortcut') && timer_shortcut_1.affectShortcut();
};
exports.increase = () => {
    sendMainWindow('timer-notify', cycle);
    timer_progressbar_1.sendProgressbar('timer-notify', cycle);
    cycle++;
};
exports.start = () => {
    // clear previous interval
    if (oIntervalTimer)
        return exports.reset();
    // set interval
    oIntervalTimer = setInterval(exports.increase, 1000);
    exports.increase();
    timer_progressbar_1.createProgressbar();
};
exports.stop = () => {
    sendMainWindow('timer-stop');
    exports.reset();
    oIntervalTimer && clearInterval(oIntervalTimer);
    oIntervalTimer = null;
    timer_progressbar_1.removeProgressbar();
};
exports.isActive = () => !!oIntervalTimer;
//# sourceMappingURL=timer.js.map