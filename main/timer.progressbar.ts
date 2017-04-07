/**
 * 타이머 바 관련
 */
import { BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { getConfig, setConfig, isActive } from './timer';
import { isDev } from './createWindow';

let barWindow: Electron.BrowserWindow | null;

// 바 윈도우로 ipc 전송
export const sendProgressbar = (channel: string, ...args: any[]) => {
    if (!barWindow) return;
    barWindow.webContents.send(channel, ...args);
};

// 바 윈도우 생성
export const createProgressbar = () => {

    removeProgressbar(); // 기존 바 윈도우 제거

    const conf = getConfig('progressbar'); // 바 윈도우 Config

    // 타이머가 미동작 중이면 생성하지 않음
    // 보임 설정이 아니면 생성하지 않음
    if (!isActive() || !conf.show) return;

    const option: Electron.BrowserWindowOptions = {
        width: 38 + (conf.transparent ? 10 : 0), height: 38,
        center: true,
        resizable: false,
        transparent: !!conf.transparent,
        frame: false, alwaysOnTop: true, maximizable: false, minimizable: false, hasShadow: false, skipTaskbar: true, focusable: false
    };

    if (+conf.x || +conf.y) { // x나 y가 지정된 경우에만 포지션을 설정하고 비어있는 경우 center에 뜨도록 한다
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

    // 바 윈도우 이동 관련 Config 동기화
    // 바로 on move에 direct로 동기화 시키면 disk에 쓰는 빈도가 너무 높아서 성능에 악영향
    // moveTimer를 생성하고 300ms 후 동기화를 예약시킨다.
    // 그 사이 move가 반복 발생하면 예약을 취소하며 새 예약을 생성하여 delay 시킨다.
    // 최종적으로 move가 발생한 후 300ms 후에 1번만 기록한다.
    let moveTimer: NodeJS.Timer | null;

    barWindow.on('move', () => { // 윈도우 move 감지
        moveTimer && clearTimeout(moveTimer); // 기존 타이머 제거
        moveTimer = setTimeout(() => { // 새 타이머 예약
            if (!barWindow) return;
            const p = barWindow.getPosition();
            setConfig('progressbar.x', p[0]); // config에 저장
            setConfig('progressbar.y', p[1]);
            moveTimer = null; // 타이머 제거
        }, 300);
    });

    isDev && barWindow.webContents.openDevTools();

};

// 바 윈도우 제거
export const removeProgressbar = () => {

    barWindow && barWindow.close();

};
