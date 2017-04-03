import { app, globalShortcut } from 'electron';
import { getConfig, ShortcutEvents } from './timer';

export const initShortcut = () => {
    app.on('will-quit', () => globalShortcut.unregisterAll());
    affectShortcut();
};

export const affectShortcut = () => {

    globalShortcut.unregisterAll();

    const shortcut = getConfig('shortcut');

    Object.keys(shortcut).forEach(type => {
        const accelerator = [shortcut[type].prefix, shortcut[type].key].filter(x => x).join('+');
        const bind = ShortcutEvents[type];
        try {
            accelerator && bind && globalShortcut.register(accelerator, bind);
        } catch (e) {
            console.error(e);
        }
    });

};
