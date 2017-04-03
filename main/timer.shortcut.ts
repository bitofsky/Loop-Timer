import { app, globalShortcut } from 'electron';
import { getConfig, start, stop } from './timer';

export const initShortcut = () => {
    app.on('will-quit', () => globalShortcut.unregisterAll());
    affectShortcut();
};

export const affectShortcut = () => {

    globalShortcut.unregisterAll();

    const shortcut = getConfig('shortcut');
    const startShortcut = [shortcut.start.prefix, shortcut.start.key].filter(x => x).join('+');
    const stopShortcut = [shortcut.stop.prefix, shortcut.stop.key].filter(x => x).join('+');

    globalShortcut.register(startShortcut, start);
    globalShortcut.register(stopShortcut, stop);

};
