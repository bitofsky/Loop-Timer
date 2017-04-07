/**
 * 키보드 단축키 관련
 */

const { getConfig, setConfig } = require('./Timer');

// 혼합키 리스트
const prefixList = ['NONE', 'CmdOrCtrl', 'Alt', 'Option', 'AltGr', 'Shift', 'Super'];

// 키코드 리스트
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

/**
 * 키보드 단축키 설정 폼 동작 구성
 */
export default () => {

    const shortcut: PresetShortcut = getConfig('shortcut');
    const $shortcut = $('.shortcut');

    Object.keys(shortcut).forEach(type => { // shortcut Config의 Key로 루프

        const upType = type.replace(/^[a-z]/, s => s.toUpperCase()); // 첫글자 대문자로 변경

        // 각 Shortcut key들 별로 컨트롤 폼 생성
        $shortcut.append(`
            <div class="col-xs-24">
                <p class="form-group-label" style="padding-top: 0px;">${upType}</p>
                <div class="col-xs-12">
                    <select class="form-control ${type} prefix"></select>
                </div>
                <div class="col-xs-12">
                    <select class="form-control ${type} key"></select>
                </div>
            </div>
        `);

        const $prefix = $(`.shortcut SELECT.${type}.prefix`); // 혼합키 SELECT
        const $key = $(`.shortcut SELECT.${type}.key`); // 키코드 SELECT

        prefixList.forEach(v => // 혼합키 OPTION 생성
            $prefix.append(`<option value="${v === 'NONE' ? '' : v}">${v}</option>`)
        );

        keyList.forEach(v => // 키코드 OPTION 생성
            $key.append(`<option value="${v === 'NONE' ? '' : v}">${v}</option>`)
        );

        // 기본 value 설정
        $prefix.val(shortcut[type].prefix);
        $key.val(shortcut[type].key);

    });

    // 변경사항이 생시면 Config에 저장
    $('.shortcut').on('change', '.prefix, .key', e => {
        Object.keys(shortcut).forEach(type => {
            shortcut[type].prefix = $(`.shortcut .${type}.prefix`).val();
            shortcut[type].key = $(`.shortcut .${type}.key`).val();
        });
        setConfig('shortcut', shortcut);
    });

};
