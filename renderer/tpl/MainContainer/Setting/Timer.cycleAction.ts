const { getConfig, setConfig, getVolume } = require('./Timer');
const { ipcRenderer } = require('electron');
const Path = require('path');

const getBackground = (style: string) => {
    style = style ? style.replace(/["'\(\);-_/\\]/g, '') : ''; // 특문 무시
    return `-webkit-linear-gradient(-45deg, transparent 33%, rgba(0, 0, 0, .1) 33%, rgba(0, 0, 0, .1) 66%, transparent 66%), -webkit-linear-gradient(top, rgba(255, 255, 255, .25), rgba(0, 0, 0, .25)), -webkit-linear-gradient(left, ${style}, ${style})`;
};

const colorLabels = (<string[]>getConfig('colors')).map(style => {
    return `<span class="label" data-style="${style}" style="background:${getBackground(style)}; cursor:pointer;">&nbsp;&nbsp;&nbsp;</span>`;
}).join('&nbsp;');

/**
 * 사이클 편집 폼 동작 구성
 */
export default () => {

    const $cycleEdit = $('#cycleEdit');
    const $cycleAdd = $('#cycleAdd');
    const $cycleDialog = $('#cycleDialog');
    const $cycleNumber = $cycleDialog.find('#cycleNumber');
    const $save = $cycleDialog.find('.save');
    const $delete = $cycleDialog.find('.delete');

    const $sound = {
        path: $cycleDialog.find('.sound.path'),
        find: $cycleDialog.find('.sound.find'),
        audio: $cycleDialog.find('.sound.audio')
    };

    const $progressbar = {
        size: $cycleDialog.find('.progressbar.size'),
        preview: $cycleDialog.find('.progressbar.preview'),
        style: $cycleDialog.find('.progressbar.style'),
        colorLabels: $cycleDialog.find('.progressbar.colorLabels').append(colorLabels),
        picker: $cycleDialog.find('.progressbar.picker')
    };

    let config: Preset;

    // 사이클 편집 버튼 구성
    const cycleEditForm = () => {

        $cycleEdit.empty();

        config.cycleAction.forEach(({ cycle }) => // 사이클 편집 버튼
            $cycleEdit.append(`<div class="col-xs-12"><button type="button" class="btn btn-primary btn-lg cycleEdit" data-cycle="${cycle}">Cycle ${cycle}</button></div>`)
        );

    };

    // 사이클 추가 관련 폼 구성
    const cycleAddForm = () => {

        $cycleAdd.empty();

        const { cycleAction, maxCycle } = config;

        if (cycleAction.length >= maxCycle) return;

        const $cycleList = $('<select class="form-control" style="margin-top: 20px;"><option value="">Add Cycle</option></select>');
        const map = {};

        cycleAction.forEach(({ cycle }) => map[cycle] = true);

        for (let i = 1; i <= maxCycle; i++)
            !map[i] && $cycleList.append(`<option value="${i}">Cycle ${i}</option>`);

        $cycleList.on('change', ({ target }) => {
            const cycle = +(<HTMLInputElement>target).value || 1;
            cycle && changeCycleAction('new', cycle);
        });

        $cycleAdd.append($cycleList);

    };

    // 사이클 액션 변경 반영
    const changeCycleAction = (type: string, value: PresetCycleAction | number) => {
        ipcRenderer.send('changeCycleAction', type, value);
        ipcRenderer.send('restart'); // 타이머 재시작
        $cycleDialog.modal('hide'); // 모달 숨김
    };

    // 사이클 편집 열기
    $cycleEdit.on('click', '.cycleEdit', ({ target }) => {

        getConfigAll(); // 최신 설정 다시 가져옴

        const $target = $(target);
        const cycle = $target.data('cycle');
        const oAction = config.cycleAction.find(oAction => oAction.cycle === cycle);

        if (!oAction) return;

        $cycleNumber.text(cycle);
        $sound.path.val(oAction.sound || '');
        $sound.audio.attr('src', getSoundPath((oAction.sound || '')));
        (<HTMLMediaElement>$sound.audio[0]).volume = +oAction.volume;
        $progressbar.size.val(oAction.size);
        $progressbar.style.val(oAction.style).change();

        $cycleDialog.modal('show');

    });

    // PB 스타일 변경
    $progressbar.style.on('change', () => {
        $progressbar.preview.css('background', getBackground($progressbar.style.val()));
    });

    // PB 사전 컬러 선택
    $progressbar.colorLabels.on('click', '.label', ({ target }) => {
        const $target = $(target);
        const style = $target.data('style');
        $progressbar.style.val(style).change();
    });

    // PB 피커로 컬러 선택
    $progressbar.picker.on('change', () => {
        $progressbar.style.val($progressbar.picker.val()).change();
    });

    const getSoundPath = (path: string) => {
        if (path.indexOf('./') === 0) path = Path.resolve(SoundRoot, path);
        return path;
    };

    const getRelationPath = (path: string) => {
        if (path.indexOf(SoundRoot) === 0) path = path.replace(SoundRoot + '\\', './');
        return path;
    }

    // 사운드 파일 선택
    $sound.find.on('click', () => {
        const { dialog } = require('electron').remote;
        let defaultPath = getSoundPath($sound.path.val());
        const filters = [{ name: 'MP3', extensions: ['mp3'] }];
        const files = dialog.showOpenDialog({ defaultPath, filters, properties: ['openFile'] });
        let sound = files ? files[0] : '';
        $sound.path.val(getRelationPath(sound));
        $sound.audio.attr('src', sound);
    });

    // 모달이 꺼질때
    $cycleDialog.on('hidden.bs.modal', () => {
        (<HTMLMediaElement>$sound.audio[0]).pause(); // 재생중인 사운드가 있다면 멈춤
    });

    // 사이클 편집 사항 저장
    $save.on('click', () => {

        const cycle = +$cycleNumber.text();
        const oAction = config.cycleAction.find(oAction => oAction.cycle === cycle);

        if (!oAction) return;

        oAction.sound = $sound.path.val() || '';
        oAction.style = $progressbar.style.val() || '';
        oAction.size = +$progressbar.size.val() || 0;
        oAction.volume = getVolume($sound.audio[0]);

        changeCycleAction('save', oAction);

    });

    // 사이클 삭제
    $delete.on('click', () => {
        const cycle = +$cycleNumber.text();
        if (!confirm(`Do you want to delete Cycle ${cycle}?`)) return;
        changeCycleAction('delete', cycle);
    });

    const getConfigAll = () => config = getConfig('all');

    const affectConfig = () => { // Config가 변경된 경우 호출하여 객체들에 적용시킴
        getConfigAll();
        cycleEditForm();
        cycleAddForm();
    };

    affectConfig(); // 최초 기본값 설정

    ipcRenderer.on('onChangeConfig', affectConfig); // 메인 프로세스에서 Config 변경시 affectConfig 실행

};