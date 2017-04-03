"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const createWindow_1 = require("./main/createWindow");
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.app.on('ready', createWindow_1.createWindow);
electron_1.app.on('activate', createWindow_1.createWindow);
//# sourceMappingURL=run.js.map