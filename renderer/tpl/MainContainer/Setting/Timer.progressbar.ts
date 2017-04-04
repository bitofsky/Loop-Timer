/**
 * 바 설정 폼 동작 구성
 */
export default () => {

    const { ipcRenderer } = require('electron');
    const { getConfig, setConfig } = require('./Timer');

    const $progressbar = { // 바 설정 관련 객체
        show: $('#progressbarShow'),
        draggable: $('#progressbarDraggable'),
        x: $('#progressbarX'),
        y: $('#progressbarY'),
        reset: $('#progressbarReset'),
    };

    const affectConfig = () => { // Config가 변경된 경우 호출하여 객체들에 적용시킴
        const { show, draggable, x, y } = getConfig('progressbar');
        $progressbar.show.prop('checked', show);
        $progressbar.draggable.prop('checked', draggable);
        $progressbar.x.val(+x || '');
        $progressbar.y.val(+y || '');
    };

    affectConfig(); // 최초 기본값 설정

    ipcRenderer.on('onChangeConfig', affectConfig); // 메인 프로세스에서 Config 변경시 affectConfig 실행

    $progressbar.show.on('change', () => { // 바 Show 체크박스
        setConfig('progressbar.show', $progressbar.show.prop('checked')); // 설정 저장
        ipcRenderer.send('createProgressbar'); // 바 재생성
    });

    $progressbar.draggable.on('change', () => { // 바 Draggable 체크박스
        setConfig('progressbar.draggable', $progressbar.draggable.prop('checked')); // 설정 저장
        ipcRenderer.send('createProgressbar'); // 바 재생성
    });

    $progressbar.reset.on('click', () => { // 바 Reset 버튼
        setConfig('progressbar.x', 0); // 설정 저장
        setConfig('progressbar.y', 0);
        ipcRenderer.send('createProgressbar'); // 바 재생성
    });

};
