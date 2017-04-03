"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
exports.debugLog = exports.isDev ? true : false;
exports.enableDebugToolButton = exports.isDev;
exports.DefaultRoute = 'Setting/Timer';
exports.Menus = [
    {
        name: 'Setting',
        html: '<span class="glyph glyph-clock" aria-hidden="true"></span> Timer Setting',
        dropdown: false,
        href: '#Setting/Timer',
        hide: true,
        children: [
            {
                name: 'Timer'
            }
        ]
    },
    {
        name: 'Download',
        html: '<span class="glyph glyph-download" aria-hidden="true"></span> Download',
        dropdown: false,
        href: `javascript: require('electron').shell.openExternal('http://hbs.pe.kr/220974213959');`
    },
    {
        name: 'DeveloperBlog',
        html: '<span class="glyph glyph-home" aria-hidden="true"></span> Developer Blog',
        dropdown: false,
        href: `javascript: require('electron').shell.openExternal('http://hbs.pe.kr');`
    }
];
exports.Menus.forEach((Menu) => {
    Menu.template = Menu.template || `MainContainer/${Menu.name}`;
    Menu.href = Menu.href || `#${Menu.name}`;
    Menu.children && Menu.children.forEach(Child => {
        Child.template = Child.template || `MainContainer/${Menu.name}/${Child.name}`;
        Child.href = Child.href || `#${Menu.name}/${Child.name}`;
    });
});
/**
 * Hash Path로부터 현재 Menu를 반환한다.
 */
exports.getMenuFromPath = (currentPath) => {
    const [parent, child] = currentPath.split('/'); // separater split
    const Parent = exports.Menus.find(({ name }) => name === parent);
    if (!Parent)
        throw new Error('Invalid menu path : ' + currentPath);
    const oChild = !child || !Parent || !Parent.children || !Parent.children.length ? null : Parent.children.find(({ name }) => name === child);
    const Menu = oChild || Parent;
    return { Parent, Menu };
};
//# sourceMappingURL=Config.js.map