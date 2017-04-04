/**
 * 타이머 단축키 관련
 */
import { app, globalShortcut } from 'electron';
import { getConfig, ShortcutEvents } from './timer';

// 단축기 초기화
export const initShortcut = () => {
    app.on('will-quit', () => globalShortcut.unregisterAll()); // 앱이 종료될 때 모든 글로벌 단축키 제거 예약
    affectShortcut(); // 단축키 설정
};

// 단축키 설정
export const affectShortcut = () => {

    globalShortcut.unregisterAll(); // 기존 단축키 제거

    const shortcut = getConfig('shortcut'); // 단축키 관련 config

    Object.keys(shortcut).forEach(type => { // Key로 루프 돌면서 단축키 셋팅
        const accelerator = [shortcut[type].prefix, shortcut[type].key].filter(x => x).join('+'); // "prefix+key"
        const bind = ShortcutEvents[type];
        try {
            accelerator && bind && globalShortcut.register(accelerator, bind); // 단축키 등록
        } catch (e) {
            console.error(e); // 단축키 설정이 잘못된 경우 exception이 발생할 수 있다. 무시한다.
        }
    });

};
