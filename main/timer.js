"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const ElectronConfig = require('electron-config');
let mainWindow;
let barWindow;
let oIntervalTimer;
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
const mainWindowSend = (channel, ...args) => {
    if (!mainWindow)
        return;
    mainWindow.webContents.send(channel, ...args);
};
const barWindowSend = (channel, ...args) => {
    if (!barWindow)
        return;
    barWindow.webContents.send(channel, ...args);
};
// timer init
exports.init = (win) => {
    mainWindow = win;
    mainWindow.on('close', exports.stop);
    electron_1.app.on('will-quit', () => electron_1.globalShortcut.unregisterAll());
    electron_1.ipcMain.on('reset', exports.reset);
    electron_1.ipcMain.on('start', exports.start);
    electron_1.ipcMain.on('stop', exports.stop);
    electron_1.ipcMain.on('getConfig', (e, key) => e.returnValue = exports.getConfig(key));
    electron_1.ipcMain.on('setConfig', (event, key, value) => exports.setConfig(key, value));
    electron_1.ipcMain.on('createBar', exports.createBar);
    electron_1.globalShortcut.register('CommandOrControl+1', exports.start);
    electron_1.globalShortcut.register('CommandOrControl+2', exports.stop);
};
exports.reset = () => cycle = 0;
exports.getConfig = (key) => oConfig.get(key);
exports.setConfig = (key, value) => {
    oConfig.set(key, value);
    mainWindowSend('affectConfig');
};
exports.increase = () => {
    mainWindowSend('timer-notify', cycle);
    barWindowSend('timer-notify', cycle);
    cycle++;
};
exports.start = () => {
    // clear previous interval
    if (oIntervalTimer)
        return exports.reset();
    // set interval
    oIntervalTimer = setInterval(exports.increase, 1000);
    exports.increase();
    exports.createBar();
};
exports.stop = () => {
    mainWindowSend('timer-stop');
    exports.reset();
    oIntervalTimer && clearInterval(oIntervalTimer);
    oIntervalTimer = null;
    exports.removeBar();
};
exports.createBar = () => {
    exports.removeBar();
    const conf = exports.getConfig('progressbar');
    if (!oIntervalTimer)
        return;
    if (!conf.show)
        return;
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
    barWindow = new electron_1.BrowserWindow(option);
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
    let moveTimer;
    barWindow.on('move', () => {
        moveTimer && clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
            if (!barWindow)
                return;
            const p = barWindow.getPosition();
            exports.setConfig('progressbar.x', p[0]);
            exports.setConfig('progressbar.y', p[1]);
            moveTimer = null;
        }, 300);
    });
    //barWindow.webContents.openDevTools();
};
exports.removeBar = () => {
    barWindow && barWindow.close();
};
//# sourceMappingURL=timer.js.map