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

    const $audios: JQuery = $('audio'); // 오디오 객체들

    const $timer = { // 타이머 제어 관련
        notify: $('#timerNotify'),
        start: $('#timerStart'),
        stop: $('#timerStop'),
        maxCycle: $('#maxCycle')
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

    const affectConfig = () => { // Config가 변경된 경우 호출하여 객체들에 적용시킴
        maxCycle = getConfig('maxCycle');

        $timer.maxCycle.val(maxCycle);
    };

    affectConfig(); // 최초 기본값 설정

    // 메인 프로세스에서 Config 변경시 affectConfig 실행
    ipcRenderer.on('onChangeConfig', affectConfig);

    // Cycle Update 수신
    ipcRenderer.removeAllListeners('timerNotify');
    ipcRenderer.on('timerNotify', (event, cycle) => {

        $timer.notify.text(cycle);

        switch (true) { // audio 플레이
            case cycle === 0: audioPlay(0); break;
            case cycle === 4: audioPlay(1); break;
            case cycle === maxCycle - 3: audioPlay(2); break;
        }

        // 끝까지 진행된 경우 Cycle 초기화 보냄
        if (cycle >= maxCycle) ipcRenderer.send('reset');

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
