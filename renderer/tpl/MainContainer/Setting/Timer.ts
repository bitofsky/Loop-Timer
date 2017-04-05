/**
 * 렌더러 타이머 설정 페이지 관련
 */
const { ipcRenderer } = require('electron');

// 메인에서 Config 가져온다
export const getConfig = (key: string) => ipcRenderer.sendSync('getConfig', key);

// 메인에 Config 저장한다
export const setConfig = (key: string, value: any) => ipcRenderer.send('setConfig', key, value);

// Timer TPL 구성 후 실행
export default () => {

    let maxCycle = getConfig('maxCycle');
    let cycleAction = getConfig('cycleAction');

    const $audios: JQuery = $('audio'); // 오디오 객체들

    const $timer = { // 타이머 제어 관련
        notify: $('#timerNotify'),
        start: $('#timerStart'),
        stop: $('#timerStop'),
        maxCycle: $('#maxCycle'),
        cycleAction: $('#cycleAction')
    };

    // 오디오 모두 중지
    const audioStop = () => $audios.each((i: number, el: HTMLMediaElement) => {
        el.pause();
    });

    // 오디오 모두 초기화
    const audioReset = () => $audios.each((i: number, el: HTMLMediaElement) => {
        el.currentTime = 0;
    });

    // 오디오 시작
    const audioPlay = (id: string) => $audios.filter('#' + id).each((i: number, el: HTMLMediaElement) => {
        el.currentTime = 0;
        el.play();
    });

    const affectConfig = () => { // Config가 변경된 경우 호출하여 객체들에 적용시킴
        maxCycle = getConfig('maxCycle');
        cycleAction = getConfig('cycleAction');
        $timer.maxCycle.val(maxCycle);
    };

    affectConfig(); // 최초 기본값 설정

    // 메인 프로세스에서 Config 변경시 affectConfig 실행
    ipcRenderer.on('onChangeConfig', affectConfig);

    // Cycle Update 수신
    ipcRenderer.removeAllListeners('timerNotify');
    ipcRenderer.on('timerNotify', (event, cycle) => {

        $timer.notify.text(cycle);

        // 끝까지 진행된 경우 Cycle 초기화 보냄
        if (cycle >= maxCycle) ipcRenderer.send('reset');

        // 현재 사이클의 동작 확인
        const oAction = cycleAction.find((oAction: any) => oAction.cycle === cycle);

        if (!oAction) return;

        // 사운드 재생
        oAction.sound && audioPlay(oAction.sound);

    });

    // Timer Stop 수신
    ipcRenderer.removeAllListeners('timerStop');
    ipcRenderer.on('timerStop', () => {
        $timer.notify.text(0);
        audioStop(); // 오디오 중지
        audioReset(); // 오디오 초기화
    });

    $timer.start.on('click', () => ipcRenderer.send('start')); // 타이머 시작 버튼 Click 이벤트
    $timer.stop.on('click', () => ipcRenderer.send('stop')); // 타이머 중지 버튼 Click 이벤트
    $timer.maxCycle.on('change', () => {
        setConfig('maxCycle', +$timer.maxCycle.val()); // 설정 저장
        ipcRenderer.send('createProgressbar'); // 바 재생성
    });

    require('./Timer.progressbar').default(); // 바 설정 폼 구성
    require('./Timer.shortcut').default(); // 단축키 설정 폼 구성

};
