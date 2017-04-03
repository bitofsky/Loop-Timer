import * as AJST from 'ajst';
import * as fs from 'fs';
import { remote } from 'electron';

export { AJST };

const $window = $(window);

// find browser root directory
const importJsUrl = `${Root}/$id.js`;

// AJST default option
AJST.option({ url: `$id.html`, importJs: false, importJsUrl });

const AJSTGet = async (selector: string | JQuery, id: string, data?: any, option?: AJST.Option, isAppend = false) => {

    option = option || {};
    data = await data;

    const jsUrl = getImportJsURL(id);
    const $target = $(selector);
    const html = await AJST.get(id, data, option);

    isAppend ? $target.append(html) : $target.html(html);

    $window.trigger('resize');

    if (!option.importJs && fs.existsSync(jsUrl)) {
        const mod = require(jsUrl);
        const func = mod && typeof mod.default === 'function' ? mod.default : null;
        data = func ? await func(data) : data;
    }

    // Tooltip enable
    $target.find('[data-toggle="tooltip"]').tooltip();

    return $target;

};

const getImportJsURL = (id: string) => importJsUrl.replace(/\$id/g, id);
export const TPL = (selector: string | JQuery, id: string, data?: any, option?: AJST.Option) => AJSTGet(selector, id, data, option, false);
export const TPLAppend = (selector: string | JQuery, id: string, data?: any, option?: AJST.Option) => AJSTGet(selector, id, data, option, true);
export const flushCaches = () => AJST.flushCaches();

// win controls
const getBrowserWindow = () => remote.BrowserWindow.getFocusedWindow();
export const close = () => getBrowserWindow().close();
export const openDevTools = () => getBrowserWindow().webContents.openDevTools();
export const toggleDevtools = () => getBrowserWindow().webContents.toggleDevTools();
export const minimize = () => getBrowserWindow().minimize();
export const maximize = () => {
    const oBrowserWindow = getBrowserWindow();
    oBrowserWindow.isMaximized() ? oBrowserWindow.unmaximize() : oBrowserWindow.maximize();
};
