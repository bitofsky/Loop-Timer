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
    const $delete = $presets.find('.delete');
    const $name = $presetDialog.find('INPUT.name');
    const $export = $presetDialog.find('INPUT.export');
    const $exportInvalid = $presetDialog.find('.export-invalid');
    const $save = $presetDialog.find('.save');

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

    const getBase64 = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64');
    const parseBase64 = (base64: string) => {
        try {
            const result = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
            $exportInvalid.text('');
            return result;
        } catch (e) { // 잘못된 base64
            console.error(e);
            $exportInvalid.text('Invalid Import config');
        }
    };

    // 프리셋 편집
    const onEdit = () => {
        const config = getConfig('all');
        const base64 = getBase64(config);
        $name.val(config.name);
        $export.val(base64);
        $exportInvalid.text('');
        $presetDialog.modal('show');
    };

    // 프리셋 저장
    const onSave = () => {
        const config = getConfig('all');
        const base64 = getBase64(config);
        const newConfig: string = $export.val();

        config.name = $name.val();

        // base64가 변경된 경우 저장
        newConfig !== base64 && Object.assign(config, parseBase64(newConfig) || {});

        ipcRenderer.send('changePreset', 'save', config);
        $presetDialog.modal('hide');
    };

    // 새 프리셋 추가
    const onNew = () => ipcRenderer.send('changePreset', 'new');
    const onDelete = () => {
        const config = getConfig('all');
        if (!confirm(`Do you want to delete this preset?\n\n${config.name}`)) return;
        ipcRenderer.send('changePreset', 'delete');
    };

    drawPresetSelect();

    // 메인 프로세스에서 Config 변경시 drawPresetSelect 실행
    ipcRenderer.on('onChangeConfig', drawPresetSelect);

    // 프리셋이 변경되면 presetIdx를 저장한다.
    $presets.on('change', '.preset', ({ target }) => {
        setConfig('presetIdx', (<HTMLInputElement>target).value);
    });

    $edit.on('click', onEdit);
    $new.on('click', onNew);
    $delete.on('click', onDelete);
    $save.on('click', onSave);
    $export.on('keyup', ({ target }) => parseBase64((<HTMLInputElement>target).value));

};
