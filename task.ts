import { exec } from 'child_process';

let isBuildNow: Promise<any> | null;
let oIpcElectron: any = null;

const project = '.';

const buildTsc = (project: string) => isBuildNow = isBuildNow || new Promise((resolve, reject) => {
    const args = ['-p', project].join(' ');

    console.log(`tsc ${args} : ${new Date()}`);

    exec(`${__dirname}/node_modules/.bin/tsc ${args}`, (err, o, e) => {
        isBuildNow = null;
        if (err)
            reject(o);
        else {
            resolve();
            ipcElectronSend('tsc:build');
        }
    });

});

const ipcElectronConnect = (message: string) => {

    const ipc: any = require('node-ipc');
    ipc.config.appspace = require('./package.json').ipc.appspace;
    ipc.config.id = require('./package.json').ipc.id;
    ipc.config.retry = 2000;
    ipc.config.silent = true;

    ipc.connectTo(
        ipc.config.id,
        function () {
            oIpcElectron = ipc.of[ipc.config.id];
            const path = oIpcElectron.path;
            oIpcElectron.on('connect', () => console.log(`Electron AutoReload : IPC Connected : ${path}`));
            oIpcElectron.emit('message', message);
        }
    );
};

const ipcElectronSend = (message: string) =>
    oIpcElectron ? oIpcElectron.emit('message', message) : ipcElectronConnect(message);

export const task = (enableElectron: boolean, enableWatch: boolean) => new Promise(async (resolve, reject) => {

    try {

        const execute = () => buildTsc(project);
        const { spawn } = require('child_process');

        await buildTsc(project); // init build

        if (enableWatch) {
            const watchGlob = require('watch-glob');
            watchGlob(['tsconfig.json', 'main/**/*.ts', 'renderer/**/!(*.js|*.map)'], { delay: 100 }, execute, execute);
        }

        if (enableElectron) {
            const args = ['--nolazy'];
            enableWatch && args.push('--debug-brk', '--inspect=5858');
            const oSpawn = spawn('node', ['./node_modules/electron/cli.js', ...args, 'run.js'], { stdio: 'inherit' });
            oSpawn.on('close', () => resolve());
        }

        if (!enableElectron && !enableWatch) // just build
            resolve();

    } catch (e) {
        reject(e);
    }

});

// > node build run
// > node build run watch (for VSCode debug)
const enableElectron = process.argv.includes('run');
const enableWatch = process.argv.includes('watch');
const exit = (err?: Error) => {
    err && console.error(err);
    process.exit();
};

task(enableElectron, enableWatch).then(() => exit()).catch(exit);
