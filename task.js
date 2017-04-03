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
const child_process_1 = require("child_process");
let isBuildNow;
let oIpcElectron = null;
const project = '.';
const buildTsc = (project) => isBuildNow = isBuildNow || new Promise((resolve, reject) => {
    const args = ['-p', project].join(' ');
    console.log(`tsc ${args} : ${new Date()}`);
    child_process_1.exec(`${__dirname}/node_modules/.bin/tsc ${args}`, (err, o, e) => {
        isBuildNow = null;
        if (err)
            reject(o);
        else {
            resolve();
            ipcElectronSend('tsc:build');
        }
    });
});
const ipcElectronConnect = (message) => {
    const ipc = require('node-ipc');
    ipc.config.appspace = require('./package.json').ipc.appspace;
    ipc.config.id = require('./package.json').ipc.id;
    ipc.config.retry = 2000;
    ipc.config.silent = true;
    ipc.connectTo(ipc.config.id, function () {
        oIpcElectron = ipc.of[ipc.config.id];
        const path = oIpcElectron.path;
        oIpcElectron.on('connect', () => console.log(`Electron AutoReload : IPC Connected : ${path}`));
        oIpcElectron.emit('message', message);
    });
};
const ipcElectronSend = (message) => oIpcElectron ? oIpcElectron.emit('message', message) : ipcElectronConnect(message);
exports.task = (enableElectron, enableWatch) => new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
    try {
        const execute = () => buildTsc(project);
        const { spawn } = require('child_process');
        yield buildTsc(project); // init build
        if (enableWatch) {
            const watchGlob = require('watch-glob');
            watchGlob(['tsconfig.json', 'main/**/*.ts', 'renderer/**/!(*.js|*.map)'], { delay: 100 }, execute, execute);
        }
        if (enableElectron) {
            const oSpawn = spawn('node', ['./node_modules/electron/cli.js', 'run.js', '--nolazy', enableWatch ? '--debug-brk' : ''], { stdio: 'inherit' });
            oSpawn.on('close', () => resolve());
        }
        if (!enableElectron && !enableWatch)
            resolve();
    }
    catch (e) {
        reject(e);
    }
}));
// > node build run
// > node build run watch (for VSCode debug)
const enableElectron = process.argv.includes('run');
const enableWatch = process.argv.includes('watch');
const exit = (err) => {
    err && console.error(err);
    process.exit();
};
exports.task(enableElectron, enableWatch).then(() => exit()).catch(exit);
//# sourceMappingURL=task.js.map