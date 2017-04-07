/**
 * 프리셋 설정 폼 동작 구성
 */
const { ipcRenderer } = require('electron');
const { getConfig, setConfig } = require('./Timer');

export default () => {

    const $presets = $('#presets');
    const $presetDialog = $('#presetDialog');
    const $edit = $presets.find('.edit');
    const $new = $presets.find('.new');

    // 프리셋 폼 선택기 구성
    const drawPresetSelect = () => {

        const $select = $('<select class="form-control preset"/>');
        const presets: Preset[] = getConfig('presets');
        const presetIdx = getConfig('presetIdx');

        $presets.find('.select').empty().append($select);

        // Preset 별 OPTION 생성
        presets.forEach(({ name }, idx) => $(`<option value="${idx}">${name}</option>`).appendTo($select));

        $select.val(presetIdx);

    };

    // 프리셋 편집
    const onEdit = () => {

    };

    // 새 프리셋 추가
    const onNew = () => ipcRenderer.send('newPreset');

    drawPresetSelect();

    // 메인 프로세스에서 Config 변경시 drawPresetSelect 실행
    ipcRenderer.on('onChangeConfig', drawPresetSelect);

    // 프리셋이 변경되면 presetIdx를 저장한다.
    $presets.on('change', '.preset', ({ target }) => {
        setConfig('presetIdx', (<HTMLInputElement>target).value);
    });

    $edit.on('click', onEdit);
    $new.on('click', onNew);

};
