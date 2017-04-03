"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcRenderer } = require('electron');
exports.getConfig = (key) => ipcRenderer.sendSync('getConfig', key);
exports.setConfig = (key, value) => ipcRenderer.send('setConfig', key, value);
exports.default = () => {
    const $audios = $('audio');
    const $timer = {
        notify: $('#timerNotify'),
        start: $('#timerStart'),
        stop: $('#timerStop')
    };
    const audioStop = () => $audios.each((i, el) => {
        el.pause();
    });
    const audioReset = () => $audios.each((i, el) => {
        el.currentTime = 0;
    });
    const audioResume = () => $audios.each((i, el) => {
        !!el.currentTime && el.paused && !el.ended && el.play();
    });
    const audioPlay = (idx) => $audios[idx].play();
    ipcRenderer.removeAllListeners('timerNotify');
    ipcRenderer.removeAllListeners('timer-active');
    ipcRenderer.on('timerNotify', (event, cycle) => {
        $timer.notify.text(cycle);
        if (cycle % 4 === 0)
            audioPlay(cycle / 4);
        if (cycle >= 15)
            ipcRenderer.send('reset');
        audioResume();
    });
    ipcRenderer.on('timerStop', () => {
        $timer.notify.text(0);
        audioStop();
        audioReset();
    });
    ipcRenderer.on('timerPause', audioStop);
    $timer.start.on('click', () => ipcRenderer.send('start'));
    $timer.stop.on('click', () => ipcRenderer.send('stop'));
    require('./Timer.progressbar')();
    require('./Timer.shortcut')();
};
//# sourceMappingURL=Timer.js.map