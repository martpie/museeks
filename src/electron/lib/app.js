import { BrowserWindow, app, powerSaveBlocker } from 'electron';

let sleepBlockerId;

const restart = () => {
    app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] });
    app.exit(0);
};

const toggleSleepBlocker = (toggle, mode) => {
    if (toggle) {
        sleepBlockerId = powerSaveBlocker.start(mode);
    } else {
        powerSaveBlocker.stop(sleepBlockerId);
        delete(sleepBlockerId);
    }
};

export default {
    restart,
    toggleSleepBlocker,
    browserWindows: {
        main: BrowserWindow.getAllWindows()[0]
    },
    version: app.getVersion()
}
