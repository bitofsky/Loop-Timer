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
    hide?: boolean;
    extra?: any;
}

/**
 * window
 */
interface Window {
    Root: string;
    SoundRoot: string;
    initBody(): void;
}

interface JQuery {
    tooltip(...args): JQuery;
    modal(...args): JQuery;
}

declare var window: Window;
declare const Root: string;
declare const SoundRoot: string;
declare const Package: string;

/**
 * Loop Timer Config
 */
interface Config {
    presetIdx: number;
    presets: Preset[];
}

interface Preset {
    name: string;
    progressbar: PresetProgressbar,
    shortcut: PresetShortcut,
    interval: number,
    maxCycle: number,
    cycleAction: PresetCycleAction[]
}

interface PresetProgressbar {
    show: boolean,
    draggable: boolean,
    transparent: boolean,
    x: number,
    y: number
}

interface PresetShortcut {
    start: PresetShortcutEvent,
    stop: PresetShortcutEvent
}

interface PresetShortcutEvent {
    prefix: string,
    key: string
}

interface PresetCycleAction {
    cycle: number;
    size: number;
    style: string;
    sound?: string | null;
    volume: number;
}
