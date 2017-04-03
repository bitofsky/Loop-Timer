const { ipcRenderer } = require('electron');

export const getConfig = (key: string) => ipcRenderer.sendSync('getConfig', key);

export const setConfig = (key: string, value: any) => ipcRenderer.send('setConfig', key, value);

export default () => {

    const $audios: JQuery = $('audio');

    const $timer = {
        notify: $('#timerNotify'),
        start: $('#timerStart'),
        stop: $('#timerStop')
    };

    const audioStop = () => $audios.each((i: number, el: HTMLMediaElement) => {
        el.pause();
        el.currentTime = 0;
    });

    const audioPlay = (idx: number) => (<HTMLMediaElement>$audios[idx]).play();

    ipcRenderer.removeAllListeners('timerNotify');
    ipcRenderer.removeAllListeners('timer-active');

    ipcRenderer.on('timerNotify', (event, cycle) => {
        $timer.notify.text(cycle);
        if (cycle % 4 === 0) audioPlay(cycle / 4);
        if (cycle >= 15) ipcRenderer.send('reset');
    });

    ipcRenderer.on('timerStop', (event) => {
        $timer.notify.text(0);
        audioStop();
    });

    $timer.start.on('click', () => ipcRenderer.send('start'));
    $timer.stop.on('click', () => ipcRenderer.send('stop'));

    require('./Timer.progressbar')();
    require('./Timer.shortcut')();

};
