import { BrowserWindow, app, powerSaveBlocker } from 'electron';

const sleepBlocker = {};

const restart = () => {
    app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] });
    app.exit(0);
};

const toggleSleepBlocker = (toggle, mode) => {
    if (toggle) {
        sleepBlocker.id = powerSaveBlocker.start(mode);
    } else {
        powerSaveBlocker.stop(sleepBlocker.id);
        delete(sleepBlocker.id);
    }
};

export default {
    restart,
    toggleSleepBlocker,
    browserWindows: {
        main: BrowserWindow.getAllWindows()[0]
    },
}
