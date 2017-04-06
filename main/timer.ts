/**
 * 메인 프로세스에서 타이머 관리
 */

import { ipcMain } from 'electron';
import { initShortcut, affectShortcut } from './timer.shortcut'; // 타이머 단축키
import { createProgressbar, removeProgressbar, sendProgressbar } from './timer.progressbar'; // 타이머 바

const ElectronConfig = require('electron-config');
const path = require('path');

let mainWindow: Electron.BrowserWindow | null;
let oIntervalTimer: NodeJS.Timer | null;
let cycle = 0;

// 메인 윈도우로 ipc 전송
export const sendMainWindow = (channel: string, ...args: any[]) => {
    if (!mainWindow) return;
    mainWindow.webContents.send(channel, ...args);
};

// 메인 윈도우가 생성될 때 호출하여 관련 이벤트를 초기화 한다
export const init = (win: Electron.BrowserWindow) => {

    mainWindow = win;
    mainWindow.on('close', stop);

    // 렌더러 프로세스에서 ipc를 통해 호출할 수 있도록 매핑한다.
    ipcMain.on('reset', reset);
    ipcMain.on('restart', () => {
        if (!isActive()) return;
        stop();
        start();
    });
    ipcMain.on('start', start);
    ipcMain.on('stop', stop);
    ipcMain.on('getCycle', (e) => e.returnValue = cycle);
    ipcMain.on('getConfig', (e, key) => e.returnValue = getConfig(key)); // getConfig는 편의상 sync로 동작시킨다
    ipcMain.on('setConfig', (event, key, value) => setConfig(key, value));
    ipcMain.on('createProgressbar', createProgressbar);

    initShortcut(); // global 단축키 초기화

};

// Reset cycle
export const reset = () => cycle = 0;

// Get Config
export const getConfig = (key: string) => {

    // special config
    if (key === 'colors') return ['#ffff00', '#0099ff', '#ff0000', '#008000', '#d800ff'];

    const idx = Config.get('presetIdx');
    return key.toLowerCase() === 'all' ? Config.get(`presets.${idx}`) : Config.get(`presets.${idx}.${key}`);
};

// Set Config
export const setConfig = (key: string, value: any) => {
    const idx = Config.get('presetIdx');
    Config.set(`presets.${idx}.${key}`, value);
    sendMainWindow('onChangeConfig');
    key.includes('shortcut') && affectShortcut();
};

// Increase Cycle
export const increase = () => {
    cycle++;
    sendMainWindow('timerNotify', cycle); // 메인 윈도우에 알림
    sendProgressbar('timerNotify', cycle); // 바 윈도우에 알림
};

// Timer Start
export const start = async () => {

    isActive() && stop(); // 이미 동작중인 경우 제거하고 초기화
    oIntervalTimer = setInterval(increase, +getConfig('interval')); // interval 시작

    createProgressbar(); // 바 윈도우 생성
    increase(); // interval과 별개로 바 윈도우가 생성되면 시작

};

// Timer Stop
export const stop = () => {
    sendMainWindow('timerStop'); // 메인 윈도우에 알림
    reset(); // 사이클 초기화
    clearLoop(); // interval 제거
    removeProgressbar(); // 바 윈도우 제거
};

// Clear Interval
export const clearLoop = () => {
    oIntervalTimer && clearInterval(oIntervalTimer);
    oIntervalTimer = null;
}

// 타이머가 동작중인지 체크
export const isActive = () => !!oIntervalTimer;

// 키보드 단축키로 제공할 함수. 반드시 Config.get('shortcut')의 키들과 일치해야 한다.
export const ShortcutEvents = { start, stop };

// Default Config
const defaults = {
    presetIdx: 0,
    presets: [
        {
            name: 'Diablo3 CoE : 4 Elements',
            progressbar: {
                show: true,
                draggable: true,
                transparent: true,
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
            },
            interval: 4000,
            maxCycle: 4,
            cycleAction: [
                { cycle: 1, size: 1, style: '#ffff00', sound: path.resolve(__dirname, '../renderer/sound/ding.mp3') },
                { cycle: 2, size: 1 / 3, style: '#0099ff', sound: path.resolve(__dirname, '../renderer/sound/ding.mp3') },
                { cycle: 3, size: 2 / 3, style: '#0099ff' },
                { cycle: 4, size: 3 / 3, style: '#0099ff', sound: path.resolve(__dirname, '../renderer/sound/countdown4to1.mp3') }
            ]
        },
    ]
};

// Config 초기화
export const Config = new ElectronConfig({ defaults });

// 추가된 config 셋팅은 아래와 같은 형태로 셀프 추가 해야, 기존 버전 config가 함께 mix 된다.
// !Config.get('shortcut.pause') && Config.set('shortcut.pause', defaults.shortcut.pause);
