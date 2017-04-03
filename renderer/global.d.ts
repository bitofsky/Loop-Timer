/**
 * Config.ts
 */
type getterHref = () => string;
interface Menu {
    name: string;
    html?: string;
    href?: string;
    right?: boolean;
    children?: Menu[];
    template?: string;
    importJs?: boolean;
    dropdown?: boolean;
    dropdownHide?: boolean;
    extra?: any;
}

/**
 * window
 */
interface Window {
    Root: string;
    initBody(): void;
    timerPrepare(): void;
    timerActive(): void;
    timerNotify(cycle: number): void;
}

declare var window: Window;
declare const Root: string;
declare const Package: string;
