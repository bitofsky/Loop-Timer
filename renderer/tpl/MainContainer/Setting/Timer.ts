const { ipcRenderer } = require('electron');

export default () => {

    const $audios: JQuery = $('audio');

    const $countdown = {
        notify: $('#countdownNotify'),
        start: $('#countdownStart'),
        stop: $('#countdownStop')
    };

    const $progressbar = {
        show: $('#progressbarShow'),
        draggable: $('#progressbarDraggable'),
        x: $('#progressbarX'),
        y: $('#progressbarY'),
        reset: $('#progressbarReset'),
    };

    const audioStop = () => $audios.each((i: number, el: HTMLMediaElement) => {
        el.pause();
        el.currentTime = 0;
    });
    const audioPlay = (idx: number) => (<HTMLMediaElement>$audios[idx]).play();
    const getConfig = (key: string) => ipcRenderer.sendSync('getConfig', key);
    const setConfig = (key: string, value: any) => {
        ipcRenderer.send('setConfig', key, value);
    };
    const affectConfig = () => {
        const { show, draggable, x, y } = getConfig('progressbar');
        $progressbar.show.prop('checked', show);
        $progressbar.draggable.prop('checked', draggable);
        $progressbar.x.val(+x || '');
        $progressbar.y.val(+y || '');
    };

    affectConfig();

    ipcRenderer.removeAllListeners('timer-notify');
    ipcRenderer.removeAllListeners('timer-active');

    ipcRenderer.on('timer-notify', (event, cycle) => {
        $countdown.notify.text(cycle);
        if (cycle % 4 === 0) audioPlay(cycle / 4);
        if (cycle >= 15) ipcRenderer.send('reset');
    });

    ipcRenderer.on('timer-stop', (event) => {
        $countdown.notify.text(0);
        audioStop();
    });

    ipcRenderer.on('affectConfig', affectConfig);

    $countdown.start.on('click', () => ipcRenderer.send('start'));
    $countdown.stop.on('click', () => ipcRenderer.send('stop'));

    $progressbar.show.on('change', e => {
        setConfig('progressbar.show', $progressbar.show.prop('checked'));
        ipcRenderer.send('createBar');
    });

    $progressbar.draggable.on('change', e => {
        setConfig('progressbar.draggable', $progressbar.draggable.prop('checked'));
        ipcRenderer.send('createBar');
    });

    $progressbar.reset.on('click', () => {
        setConfig('progressbar.x', 0);
        setConfig('progressbar.y', 0);
        ipcRenderer.send('createBar');
    });

};
