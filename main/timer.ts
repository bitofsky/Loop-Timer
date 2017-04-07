/**
 * 메인 프로세스에서 타이머 관리
 */

import { ipcMain } from 'electron';
import { initShortcut, affectShortcut } from './timer.shortcut'; // 타이머 단축키
import { createProgressbar, removeProgressbar, sendProgressbar } from './timer.progressbar'; // 타이머 바
import * as path from 'path';

const ElectronConfig = require('electron-config');

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
    ipcMain.on('restart', restart);
    ipcMain.on('start', start);
    ipcMain.on('stop', stop);
    ipcMain.on('getCycle', (e) => e.returnValue = cycle);
    ipcMain.on('getConfig', (e, key) => e.returnValue = getConfig(key)); // getConfig는 편의상 sync로 동작시킨다
    ipcMain.on('setConfig', (event, key: string, value: any, silent = false) => setConfig(key, value, silent));
    ipcMain.on('createProgressbar', createProgressbar);
    ipcMain.on('changePreset', (e, type, value) => changePreset(type, value));
    ipcMain.on('changeCycleAction', (e, type, value) => changeCycleAction(type, value));

    initShortcut(); // global 단축키 초기화

};

// Restart Timer
export const restart = () => {
    if (!isActive()) return;
    stop();
    start();
};

// Reset cycle
export const reset = () => cycle = 0;

// Get Config
export const getConfig = (key: string) => {

    if (Object.keys(defaults).includes(key)) return Config.get(key);

    // special config
    if (key === 'colors') return ['#ffff00', '#0099ff', '#ff0000', '#008000', '#d800ff'];

    // get current preset config
    const idx = Config.get('presetIdx');
    return key.toLowerCase() === 'all' ? Config.get(`presets.${idx}`) : Config.get(`presets.${idx}.${key}`);
};

// Set Config
export const setConfig = (key: string, value: any, silent = false) => {

    if (Object.keys(defaults).includes(key)) {
        Config.set(key, value);
    }
    else if (key === 'all') { // set current preset all
        const idx = Config.get('presetIdx');
        Config.set(`presets.${idx}`, value);
    }
    else { // set current preset keys
        const idx = Config.get('presetIdx');
        if (key === 'cycleAction')
            value.sort((a: PresetCycleAction, b: PresetCycleAction) => a.cycle < b.cycle ? -1 : a.cycle > b.cycle ? 1 : 0);
        Config.set(`presets.${idx}.${key}`, value);
    }

    if (silent) return;

    sendMainWindow('onChangeConfig'); // 메인윈도우에 단축키가 수정되었음을 알린다.
    key.includes('preset') && restart(); // 프리셋이 수정되면 타이머를 재시작 한다.
    key.includes('shortcut') && affectShortcut(); // 단축키가 수정되면 글로벌 단축키를 재설정 한다.
    key.includes('progressbar') && createProgressbar(); // 바 설정이 수정되면 재생성 한다.
    key.includes('interval') && restart(); // 인터벌이 수정되면 타이머를 재시작 한다.
};

// 프리셋 변경
export const changePreset = (type: string, preset?: Preset) => {

    const presets = getConfig('presets');

    if (type === 'new') { // 프리셋 추가

        stop();

        // 새 프리셋을 바로 열리게 한다
        const presetIdx = presets.length;

        presets.push(NewPreset);

        setConfig('presets', presets);
        setConfig('presetIdx', presetIdx);

    }
    else if (type === 'save') { // 프리셋 저장
        setConfig('all', preset);
    }
    else if (type === 'delete') { // 프리셋 삭제

        stop();

        const presetIdx = getConfig('presetIdx');

        presets.splice(presetIdx, 1);

        setConfig('presets', presets);
        setConfig('presetIdx', 0);

        initPresets(); // 프리셋이 모두 삭제된 경우 초기화

    }

};

// 사이클 액션 변경
export const changeCycleAction = (type: string, cycleAction?: PresetCycleAction | number) => {

    let cycleActionList: PresetCycleAction[] = getConfig('cycleAction');

    if (type === 'new') { // 액션 추가
        if (cycleActionList.find((oAction) => oAction.cycle === cycleAction))
            return; // 이미 존재하는 사이클 무시
        cycleActionList.push({ cycle: <number>cycleAction, size: 0, volume: 1, style: '' });
    }
    else if (type === 'save') { // 액션 저장
        const { cycle } = <PresetCycleAction>cycleAction;
        Object.assign(cycleActionList.find(oAction => oAction.cycle === cycle), cycleAction);
    }
    else if (type === 'delete') // 액션 삭제
        cycleActionList = cycleActionList.filter(oAction => oAction.cycle !== cycleAction);

    setConfig('cycleAction', cycleActionList);

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

// Preset이 없으면 빈 Preset 설정
const initPresets = () => !Config.get('presets').length && Config.set('presets', [NewPreset]);

const NewPreset: Preset = {
    name: 'New Preset',
    interval: 1000,
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
    cycleAction: [],
    maxCycle: 1,
    progressbar: {
        show: true,
        draggable: true,
        transparent: true,
        x: 0,
        y: 0
    }
};

// Default Config
const defaults: Config = {
    presetIdx: 0,
    presets: [
        {
            name: '4 Elements : Diablo3 CoE',
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
                { cycle: 1, size: 1, style: '#ffff00', sound: path.resolve(__dirname, '../renderer/sound/ding.mp3'), volume: 1 },
                { cycle: 2, size: 1 / 3, style: '#0099ff', sound: path.resolve(__dirname, '../renderer/sound/ding.mp3'), volume: 1 },
                { cycle: 3, size: 2 / 3, style: '#0099ff', volume: 1 },
                { cycle: 4, size: 3 / 3, style: '#0099ff', sound: path.resolve(__dirname, '../renderer/sound/countdown4to1.mp3'), volume: 1 }
            ]
        },
        {
            name: '5 Elements : Diablo3 CoE',
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
            maxCycle: 5,
            cycleAction: [
                { cycle: 1, size: 1, style: '#ffff00', sound: path.resolve(__dirname, '../renderer/sound/ding.mp3'), volume: 1 },
                { cycle: 2, size: 1 / 4, style: '#0099ff', sound: path.resolve(__dirname, '../renderer/sound/ding.mp3'), volume: 1 },
                { cycle: 3, size: 2 / 4, style: '#0099ff', volume: 1 },
                { cycle: 4, size: 3 / 4, style: '#0099ff', volume: 1 },
                { cycle: 5, size: 4 / 4, style: '#0099ff', sound: path.resolve(__dirname, '../renderer/sound/countdown4to1.mp3'), volume: 1 }
            ]
        },
    ]
};

// Config 초기화
export const Config = new ElectronConfig({ defaults });

initPresets();

// 추가된 config 셋팅은 아래와 같은 형태로 셀프 추가 해야, 기존 버전 config가 함께 mix 된다.
// !Config.get('shortcut.pause') && Config.set('shortcut.pause', defaults.shortcut.pause);
