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

    const $audios: JQuery = $('audio'); // 오디오 객체들

    const $timer = { // 타이머 제어 관련
        notify: $('#timerNotify'),
        start: $('#timerStart'),
        stop: $('#timerStop')
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
    const audioPlay = (idx: number) => (<HTMLMediaElement>$audios[idx]).play();

    // Cycle Update 수신
    ipcRenderer.removeAllListeners('timerNotify');
    ipcRenderer.on('timerNotify', (event, cycle) => {
        $timer.notify.text(cycle);
        if (cycle % 4 === 0) audioPlay(cycle / 4); // mod 0 인 경우 해당 인덱스의 audio를 플레이
        if (cycle >= 15) ipcRenderer.send('reset'); // 끝까지 진행된 경우 Cycle 초기화 보냄
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

    require('./Timer.progressbar').default(); // 바 설정 폼 구성
    require('./Timer.shortcut').default(); // 단축키 설정 폼 구성

};
