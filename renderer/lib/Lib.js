"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AJST = require("ajst");
exports.AJST = AJST;
const fs = require("fs");
const electron_1 = require("electron");
const $window = $(window);
// find browser root directory
const importJsUrl = `${Root}/$id.js`;
// AJST default option
AJST.option({ url: `$id.html`, importJs: false, importJsUrl });
const AJSTGet = (selector, id, data, option, isAppend = false) => __awaiter(this, void 0, void 0, function* () {
    option = option || {};
    data = yield data;
    const jsUrl = getImportJsURL(id);
    const $target = $(selector);
    const html = yield AJST.get(id, data, option);
    isAppend ? $target.append(html) : $target.html(html);
    $window.trigger('resize');
    if (!option.importJs && fs.existsSync(jsUrl)) {
        const mod = require(jsUrl);
        const func = mod && typeof mod.default === 'function' ? mod.default : null;
        data = func ? yield func(data) : data;
    }
    // Tooltip enable
    $target.find('[data-toggle="tooltip"]').tooltip();
    return $target;
});
const getImportJsURL = (id) => importJsUrl.replace(/\$id/g, id);
exports.TPL = (selector, id, data, option) => AJSTGet(selector, id, data, option, false);
exports.TPLAppend = (selector, id, data, option) => AJSTGet(selector, id, data, option, true);
exports.flushCaches = () => AJST.flushCaches();
// win controls
const getBrowserWindow = () => electron_1.remote.BrowserWindow.getFocusedWindow();
exports.close = () => getBrowserWindow().close();
exports.openDevTools = () => getBrowserWindow().webContents.openDevTools();
exports.toggleDevtools = () => getBrowserWindow().webContents.toggleDevTools();
exports.minimize = () => getBrowserWindow().minimize();
exports.maximize = () => {
    const oBrowserWindow = getBrowserWindow();
    oBrowserWindow.isMaximized() ? oBrowserWindow.unmaximize() : oBrowserWindow.maximize();
};
//# sourceMappingURL=Lib.js.map