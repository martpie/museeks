import { remote } from 'electron';
import { rpc } from 'electron-simple-rpc';

export default {
    app: {
      restart: rpc('electron', 'app.restart'),
      restart: rpc('electron', 'app.toggleSleepBlocker'),
    },
    browserWindows: {
        main : remote.getCurrentWindow()
    },
    version: remote.app.getVersion()
}
