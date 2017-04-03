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
    Object.keys(shortcut).forEach(type => {
        const accelerator = [shortcut[type].prefix, shortcut[type].key].filter(x => x).join('+');
        const bind = timer_1.ShortcutEvents[type];
        try {
            accelerator && bind && electron_1.globalShortcut.register(accelerator, bind);
        }
        catch (e) {
            console.error(e);
        }
    });
};
//# sourceMappingURL=timer.shortcut.js.map