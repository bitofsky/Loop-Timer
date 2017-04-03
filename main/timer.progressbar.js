"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const url = require("url");
const timer_1 = require("./timer");
let barWindow;
exports.sendProgressbar = (channel, ...args) => {
    if (!barWindow)
        return;
    barWindow.webContents.send(channel, ...args);
};
exports.createProgressbar = () => {
    exports.removeProgressbar();
    const conf = timer_1.getConfig('progressbar');
    if (!timer_1.isActive())
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
            timer_1.setConfig('progressbar.x', p[0]);
            timer_1.setConfig('progressbar.y', p[1]);
            moveTimer = null;
        }, 300);
    });
    //barWindow.webContents.openDevTools();
};
exports.removeProgressbar = () => {
    barWindow && barWindow.close();
};
//# sourceMappingURL=timer.progressbar.js.map