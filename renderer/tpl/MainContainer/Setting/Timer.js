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
        el.currentTime = 0;
    });
    const audioPlay = (idx) => $audios[idx].play();
    ipcRenderer.removeAllListeners('timer-notify');
    ipcRenderer.removeAllListeners('timer-active');
    ipcRenderer.on('timer-notify', (event, cycle) => {
        $timer.notify.text(cycle);
        if (cycle % 4 === 0)
            audioPlay(cycle / 4);
        if (cycle >= 15)
            ipcRenderer.send('reset');
    });
    ipcRenderer.on('timer-stop', (event) => {
        $timer.notify.text(0);
        audioStop();
    });
    $timer.start.on('click', () => ipcRenderer.send('start'));
    $timer.stop.on('click', () => ipcRenderer.send('stop'));
    require('./Timer.progressbar')();
    require('./Timer.shortcut')();
};
//# sourceMappingURL=Timer.js.map