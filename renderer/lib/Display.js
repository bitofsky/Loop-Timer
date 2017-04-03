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
const Lib_1 = require("./Lib");
const Config = require("../Config");
const fs = require("fs");
const path = require("path");
const { DefaultRoute, getMenuFromPath, debugLog } = Config;
const $window = $(window);
const $body = $('body');
const $TopNavigation = $('TopNavigation');
const $MainContainer = $('MainContainer');
/**
 * Document Body initialize
 */
exports.Body = () => __awaiter(this, void 0, void 0, function* () {
    yield Promise.all([
        exports.TopNavigation()
    ]);
    if (location.hash)
        $window.trigger('hashchange');
    else
        location.hash = DefaultRoute;
});
/**
 * TopNavigation reder
 */
exports.TopNavigation = () => __awaiter(this, void 0, void 0, function* () {
    yield Lib_1.TPL('TopNavigation', 'TopNavigation/template', Config);
    // window control button's event
    $body.off('.TopNavigation').on('click.TopNavigation', 'TopNavigation .window-controls A', function ({ target }) {
        const $target = $(this);
        switch (true) {
            case $target.hasClass('close'): return Lib_1.close();
            case $target.hasClass('maximize'): return Lib_1.maximize();
            case $target.hasClass('minimize'): return Lib_1.minimize();
            case $target.hasClass('devtools'): return Lib_1.toggleDevtools();
        }
    });
});
/**
 * MainContainer render
 */
const MainContainer = (Menu) => __awaiter(this, void 0, void 0, function* () {
    const tplPath = path.resolve(Root, Menu.template + '.html');
    if (Menu.template && fs.existsSync(`${Root}/${Menu.template}.html`))
        yield Lib_1.TPL($MainContainer, Menu.template, Menu, { importJs: Menu.importJs });
    else if (Menu.template)
        debugLog && console.error(`MainContainer - Menu Template file not found`, tplPath);
    debugLog && console.log('MainContainer', 'tplPath', tplPath, '\nMenu', Menu);
});
/**
 * onHashChange가 발생하면 PageHeader / MainContainer를 다시 랜더링 한다.
 */
const onHashChange = () => __awaiter(this, void 0, void 0, function* () {
    try {
        const currentPath = location.hash.replace(/^#/, '');
        const { Menu, Parent } = getMenuFromPath(currentPath);
        yield Promise.all([
            MainContainer(Menu) // render MainContainer
        ]);
    }
    catch (e) {
        console.error(e);
    }
});
// Bootstrap bug? : position: fixed; 로 탑네비를 고정시키면 특정 버튼 클릭시에 --webkit-app-region이 엉뚱한데로 셋팅되는 오류가 있어 MainContainer를 resize하는 방법으로 바꾼다.
let resizeTimeout; // 마지막 리사이즈 시점으로부터 100ms 후 MainContainer.height를 변경
const onResize = () => {
    if (resizeTimeout)
        clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        $MainContainer.height($window.height() - $TopNavigation.height());
        resizeTimeout = undefined;
    }, 100);
};
$window
    .off('hashchange').on('hashchange', onHashChange)
    .off('resize').on('resize', onResize);
//# sourceMappingURL=Display.js.map