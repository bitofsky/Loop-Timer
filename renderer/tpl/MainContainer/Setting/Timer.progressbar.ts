module.exports = () => {

    const { ipcRenderer } = require('electron');
    const { getConfig, setConfig } = require('./Timer');

    const $progressbar = {
        show: $('#progressbarShow'),
        draggable: $('#progressbarDraggable'),
        x: $('#progressbarX'),
        y: $('#progressbarY'),
        reset: $('#progressbarReset'),
    };

    const affectConfig = () => {
        const { show, draggable, x, y } = getConfig('progressbar');
        $progressbar.show.prop('checked', show);
        $progressbar.draggable.prop('checked', draggable);
        $progressbar.x.val(+x || '');
        $progressbar.y.val(+y || '');
    };

    affectConfig();

    ipcRenderer.on('affectConfig', affectConfig);

    $progressbar.show.on('change', e => {
        setConfig('progressbar.show', $progressbar.show.prop('checked'));
        ipcRenderer.send('createProgressbar');
    });

    $progressbar.draggable.on('change', e => {
        setConfig('progressbar.draggable', $progressbar.draggable.prop('checked'));
        ipcRenderer.send('createProgressbar');
    });

    $progressbar.reset.on('click', () => {
        setConfig('progressbar.x', 0);
        setConfig('progressbar.y', 0);
        ipcRenderer.send('createProgressbar');
    });

};
