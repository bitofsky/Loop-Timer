import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { getConfig, setConfig, isActive } from './timer';

let barWindow: Electron.BrowserWindow | null;

export const sendProgressbar = (channel: string, ...args: any[]) => {
    if (!barWindow) return;
    barWindow.webContents.send(channel, ...args);
};

export const createProgressbar = () => {

    removeProgressbar();

    const conf = getConfig('progressbar');

    if (!isActive()) return;
    if (!conf.show) return;

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
    barWindow = new BrowserWindow(option);

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

    let moveTimer: NodeJS.Timer | null;

    barWindow.on('move', () => {
        moveTimer && clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
            if (!barWindow) return;
            const p = barWindow.getPosition();
            setConfig('progressbar.x', p[0]);
            setConfig('progressbar.y', p[1]);
            moveTimer = null;
        }, 300);
    });

    //barWindow.webContents.openDevTools();

};

export const removeProgressbar = () => {

    barWindow && barWindow.close();

};
