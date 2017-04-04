
export const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);
export const debugLog = isDev ? true : false;
export const enableDebugToolButton = isDev;
export const DefaultRoute = 'Setting/Timer'; // 기본 라우트 hash

// 상단 메뉴 구조
export const Menus: Menu[] = [
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
        name: 'Manual',
        html: '<span class="glyph glyph-help" aria-hidden="true"></span> Manual',
        dropdown: false,
        href: `javascript: require('electron').shell.openExternal('http://hbs.pe.kr/220974213959');`
    },
    {
        name: 'Download',
        html: '<span class="glyph glyph-download" aria-hidden="true"></span> Download',
        dropdown: false,
        href: `javascript: require('electron').shell.openExternal('https://github.com/bitofsky/Loop-Timer/releases');`
    },
    {
        name: 'DeveloperBlog',
        html: '<span class="glyph glyph-home" aria-hidden="true"></span> Developer Blog',
        dropdown: false,
        href: `javascript: require('electron').shell.openExternal('http://hbs.pe.kr');`
    }
];

Menus.forEach((Menu: Menu) => {
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
export const getMenuFromPath = (currentPath: string) => {

    const [parent, child] = currentPath.split('/'); // separater split

    const Parent = Menus.find(({ name }) => name === parent);

    if (!Parent) throw new Error('Invalid menu path : ' + currentPath);

    const oChild = !child || !Parent || !Parent.children || !Parent.children.length ? null : Parent.children.find(({ name }) => name === child);
    const Menu = oChild || Parent;

    return { Parent, Menu };
};
