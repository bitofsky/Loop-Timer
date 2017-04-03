"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const timer_1 = require("./timer");
exports.initShortcut = () => {
    electron_1.app.on('will-quit', () => electron_1.globalShortcut.unregisterAll());
    exports.affectShortcut();
};
exports.affectShortcut = () => {
    electron_1.globalShortcut.unregisterAll();
    const shortcut = timer_1.getConfig('shortcut');
    const startShortcut = [shortcut.start.prefix, shortcut.start.key].filter(x => x).join('+');
    const stopShortcut = [shortcut.stop.prefix, shortcut.stop.key].filter(x => x).join('+');
    electron_1.globalShortcut.register(startShortcut, timer_1.start);
    electron_1.globalShortcut.register(stopShortcut, timer_1.stop);
};
//# sourceMappingURL=timer.shortcut.js.map