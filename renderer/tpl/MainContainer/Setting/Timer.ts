/**
 * 렌더러 타이머 설정 페이지 관련
 */
const { ipcRenderer } = require('electron');

// 메인에서 Config 가져온다
export const getConfig = (key: string) => ipcRenderer.sendSync('getConfig', key);

// 메인에 Config 저장한다
export const setConfig = (key: string, value: any, silent = false) => ipcRenderer.send('setConfig', key, value, silent);

// 볼륨을 구한다.
export const getVolume = (el: HTMLMediaElement | Element) => {
    const audio = <HTMLMediaElement>el;
    return audio.muted ? 0 : audio.volume;
};

// Timer TPL 구성 후 실행
export default () => {

    const $cycleAudios = $('.cycleAudios');

    const $timer = { // 타이머 제어 관련
        notify: $('#timerNotify'),
        start: $('#timerStart'),
        stop: $('#timerStop'),
        maxCycle: $('#maxCycle'),
        interval: $('#interval')
    };

    // 오디오 모두 중지
    const audioStop = () => $cycleAudios.children('AUDIO').each((i: number, el: HTMLMediaElement) => {
        el.pause();
    });

    // 오디오 모두 초기화
    const audioReset = () => $cycleAudios.children('AUDIO').each((i: number, el: HTMLMediaElement) => {
        el.currentTime = 0;
    });

    // 오디오 시작
    const audioPlay = (cycle: number) => $cycleAudios.find('AUDIO.cycle' + cycle).each((i: number, el: HTMLMediaElement) => {
        el.currentTime = 0;
        el.play();
    });

    const getConfigAll = () => config = getConfig('all');

    const affectConfig = () => { // Config가 변경된 경우 호출하여 객체들에 적용시킴

        getConfigAll();

        $timer.maxCycle.val(config.maxCycle);
        $timer.interval.val(config.interval);

        $cycleAudios.empty();

        config.cycleAction.forEach(({ cycle, sound, volume }) => {
            if (!sound) return;
            if (sound && sound.indexOf('./') === 0) sound = require('path').resolve(SoundRoot, sound);
            const $audio = $(`<audio controls preload="none" class="cycleAudio cycle${cycle}" src="${sound}"></audio>`);
            const el = <HTMLMediaElement>$audio[0];
            el.volume = volume;
            $cycleAudios.append($audio);

            // 볼륨 변경시 볼륨을 저장한다.
            // 너무 빈번하게 저장을 호출하지 않도록 한다.
            let timer: NodeJS.Timer | null;
            $audio.on('volumechange', ({ target }) => {
                timer && clearTimeout(timer);
                timer = setTimeout(() => {
                    timer = null;
                    const oAction = config.cycleAction.find(oAction => oAction.cycle === cycle);
                    oAction && (oAction.volume = getVolume(target));
                    setConfig('cycleAction', config.cycleAction, true); // 볼륨 변경은 저장시 UI를 갱신 하지 않는다.
                }, 300);
            });
        });

    };

    let config: Preset;

    getConfigAll();
    affectConfig(); // 최초 기본값 설정

    // 메인 프로세스에서 Config 변경시 affectConfig 실행
    ipcRenderer.on('onChangeConfig', affectConfig);

    // Cycle Update 수신
    ipcRenderer.removeAllListeners('timerNotify');
    ipcRenderer.on('timerNotify', (event: Electron.Event, cycle: number) => {

        $timer.notify.text(cycle);

        // 끝까지 진행된 경우 Cycle 초기화 보냄
        if (cycle >= config.maxCycle) ipcRenderer.send('reset');

        // 현재 사이클의 동작 확인
        const oAction = config.cycleAction.find(oAction => oAction.cycle === cycle);

        if (!oAction) return;

        // 사운드 재생
        oAction.sound && audioPlay(oAction.cycle);

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
    $timer.maxCycle.on('change', () => setConfig('maxCycle', +$timer.maxCycle.val())); // maxCycle 설정 저장
    $timer.interval.on('change', () => setConfig('interval', +$timer.interval.val())); // interval 설정 저장

    require('./Timer.presets').default(); // 프리셋 설정 폼 구성
    require('./Timer.progressbar').default(); // 바 설정 폼 구성
    require('./Timer.shortcut').default(); // 단축키 설정 폼 구성
    require('./Timer.cycleAction').default(); // 사이클 설정 폼 구성

};
