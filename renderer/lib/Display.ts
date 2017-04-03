import { TPL, close, maximize, minimize, toggleDevtools } from './Lib';
import * as Config from '../Config';
import * as fs from 'fs';
import * as path from 'path';

const { DefaultRoute, getMenuFromPath, debugLog } = Config;

const $window = $(window);
const $body = $('body');
const $TopNavigation = $('TopNavigation');
const $MainContainer = $('MainContainer');

/**
 * Document Body initialize
 */
export const Body = async () => {

    await Promise.all([
        TopNavigation()
    ]);

    if (location.hash) $window.trigger('hashchange');
    else location.hash = DefaultRoute;

};

/**
 * TopNavigation reder
 */
export const TopNavigation = async () => {

    await TPL('TopNavigation', 'TopNavigation/template', Config);

    // window control button's event
    $body.off('.TopNavigation').on('click.TopNavigation', 'TopNavigation .window-controls A', function ({ target }) {

        const $target = $(this);

        switch (true) {
            case $target.hasClass('close'): return close();
            case $target.hasClass('maximize'): return maximize();
            case $target.hasClass('minimize'): return minimize();
            case $target.hasClass('devtools'): return toggleDevtools();
        }

    });
};

/**
 * MainContainer render
 */
const MainContainer = async (Menu: Menu): Promise<any> => {

    const tplPath = path.resolve(Root, Menu.template + '.html');

    if (Menu.template && fs.existsSync(`${Root}/${Menu.template}.html`))
        await TPL($MainContainer, Menu.template, Menu, { importJs: Menu.importJs });
    else if (Menu.template)
        debugLog && console.error(`MainContainer - Menu Template file not found`, tplPath);

    debugLog && console.log('MainContainer', 'tplPath', tplPath, '\nMenu', Menu);

};

/**
 * onHashChange가 발생하면 PageHeader / MainContainer를 다시 랜더링 한다.
 */
const onHashChange = async () => {

    try {

        const currentPath = location.hash.replace(/^#/, '');
        const { Menu, Parent } = getMenuFromPath(currentPath);

        await Promise.all([
            MainContainer(Menu) // render MainContainer
        ]);

    } catch (e) { console.error(e); }

};

// Bootstrap bug? : position: fixed; 로 탑네비를 고정시키면 특정 버튼 클릭시에 --webkit-app-region이 엉뚱한데로 셋팅되는 오류가 있어 MainContainer를 resize하는 방법으로 바꾼다.
let resizeTimeout: NodeJS.Timer | undefined; // 마지막 리사이즈 시점으로부터 100ms 후 MainContainer.height를 변경
const onResize = () => {

    if (resizeTimeout) clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        $MainContainer.height($window.height() - $TopNavigation.height());
        resizeTimeout = undefined;
    }, 100);

};

$window
    .off('hashchange').on('hashchange', onHashChange)
    .off('resize').on('resize', onResize);
