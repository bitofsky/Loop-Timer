/**
 * 바 설정 폼 동작 구성
 */
const { ipcRenderer } = require('electron');
const { getConfig, setConfig } = require('./Timer');

export default () => {

    let config: PresetProgressbar;

    const $progressbar = { // 바 설정 관련 객체
        form: $('.progressbar'),
        show: $('.progressbar INPUT.show'),
        draggable: $('.progressbar INPUT.draggable'),
        transparent: $('.progressbar INPUT.transparent'),
        x: $('.progressbar INPUT.x'),
        y: $('.progressbar INPUT.y'),
        reset: $('.progressbar SPAN.reset'),
    };

    const affectConfig = () => { // Config가 변경된 경우 호출하여 객체들에 적용시킴
        config = getConfig('progressbar');
        $progressbar.show.prop('checked', config.show);
        $progressbar.draggable.prop('checked', config.draggable);
        $progressbar.x.val(+config.x || '');
        $progressbar.y.val(+config.y || '');
    };

    affectConfig(); // 최초 기본값 설정

    ipcRenderer.on('onChangeConfig', affectConfig); // 메인 프로세스에서 Config 변경시 affectConfig 실행
    ipcRenderer.on('onChangeProgressbarPosition', (event: Electron.Event, x: number, y: number) => {
        $progressbar.x.val(+x || '');
        $progressbar.y.val(+y || '');
    });

    $progressbar.form.on('change', 'INPUT[type=checkbox]', () => { // 체크박스 on/off 시 Config 저장
        setConfig('progressbar', Object.assign(getConfig('progressbar'), {
            show: $progressbar.show.prop('checked'),
            draggable: $progressbar.draggable.prop('checked'),
            transparent: $progressbar.transparent.prop('checked'),
        }));
    });

    $progressbar.reset.on('click', () => { // 바 Reset 버튼
        setConfig('progressbar.x', 0); // 설정 저장
        setConfig('progressbar.y', 0);
    });

};
