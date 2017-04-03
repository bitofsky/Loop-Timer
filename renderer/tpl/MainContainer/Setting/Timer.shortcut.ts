const prefixList = ['-', 'CmdOrCtrl', 'Alt', 'Option', 'AltGr', 'Shift', 'Super'];

const keyList = [
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

    const $shortcut = {
        start: {
            prefix: $('.shortcut .start.prefix'),
            key: $('.shortcut .start.key')
        },
        stop: {
            prefix: $('.shortcut .stop.prefix'),
            key: $('.shortcut .stop.key')
        }
    };

    prefixList.forEach(v => {
        $shortcut.start.prefix.append(`<option value="${v === '-' ? '' : v}">${v}</option>`);
        $shortcut.stop.prefix.append(`<option value="${v === '-' ? '' : v}">${v}</option>`);
    });

    keyList.forEach(v => {
        $shortcut.start.key.append(`<option value="${v}">${v}</option>`);
        $shortcut.stop.key.append(`<option value="${v}">${v}</option>`);
    });

    const shortcut = getConfig('shortcut');

    Object.keys(shortcut).forEach(type => {
        $shortcut[type].prefix.val(shortcut[type].prefix);
        $shortcut[type].key.val(shortcut[type].key);
    });

    $('.shortcut').on('change', '.prefix, .key', e => {
        Object.keys(shortcut).forEach(type => {
            shortcut[type].prefix = $shortcut[type].prefix.val();
            shortcut[type].key = $shortcut[type].key.val();
        });
        setConfig('shortcut', shortcut);
    });

};
