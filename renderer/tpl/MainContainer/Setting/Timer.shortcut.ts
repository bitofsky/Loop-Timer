const prefixList = ['NONE', 'CmdOrCtrl', 'Alt', 'Option', 'AltGr', 'Shift', 'Super'];

const keyList = [
    'NONE',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
    'L', 'N', 'M', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
    'W', 'X', 'Y', 'Z',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10',
    'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F17', 'F18', 'F19', 'F20',
    'F21', 'F22', 'F23', 'F24',
    '~', 'Plus', 'Space', 'Tab', 'Backspace', 'Delete', 'Insert', 'Enter', 'Up', 'Down',
    'Left', 'Right', 'Home', 'End', 'PageUp', 'PageDown', 'Esc', 'VolumeUp', 'VolumeDown', 'VolumeMute', 'MediaNextTrack',
    'MediaPreviousTrack', 'MediStop', 'MediaPlayPause', 'PrintScreen'
];

module.exports = () => {

    const { getConfig, setConfig } = require('./Timer');
    const shortcut = getConfig('shortcut');
    const $shortcut = $('.shortcut');

    Object.keys(shortcut).forEach(type => {

        $shortcut.append(`
        <div class="col-xs-24">
            <p class="form-group-label" style="padding-top: 0px;">${type.replace(/^[a-z]/, s => s.toUpperCase())}</p>
            <div class="col-xs-12">
                <select class="form-control ${type} prefix"></select>
            </div>
            <div class="col-xs-12">
                <select class="form-control ${type} key"></select>
            </div>
        </div>
        `);

        const $prefix = $(`.shortcut .${type}.prefix`);
        const $key = $(`.shortcut .${type}.key`);

        prefixList.forEach(v =>
            $prefix.append(`<option value="${v === 'NONE' ? '' : v}">${v}</option>`)
        );

        keyList.forEach(v =>
            $key.append(`<option value="${v === 'NONE' ? '' : v}">${v}</option>`)
        );

        $prefix.val(shortcut[type].prefix);
        $key.val(shortcut[type].key);

    });

    $('.shortcut').on('change', '.prefix, .key', e => {
        Object.keys(shortcut).forEach(type => {
            shortcut[type].prefix = $(`.shortcut .${type}.prefix`).val();
            shortcut[type].key = $(`.shortcut .${type}.key`).val();
        });
        setConfig('shortcut', shortcut);
    });

};
