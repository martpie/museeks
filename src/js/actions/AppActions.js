import Player from '../lib/player';
import app    from '../lib/app';

import LibraryActions       from './LibraryActions';
import PlaylistsActions     from './PlaylistsActions';
import PlayerActions        from './PlayerActions';
import SettingsActions      from './SettingsActions';

const globalShortcut = electron.remote.globalShortcut;
const ipcRenderer    = electron.ipcRenderer;
const player         = PlayerActions;
const playlists      = PlaylistsActions;
const library        = LibraryActions;
const settings       = SettingsActions;

const init = () => {
    // Usual tasks
    library.load();
    playlists.refresh();
    settings.check();
    initShortcuts();
    start();

    // Bind player events
    // Audio Events
    Player.getAudio().addEventListener('ended', player.next);
    Player.getAudio().addEventListener('error', player.audioError);
    Player.getAudio().addEventListener('timeupdate', () => {
        if (Player.isThresholdReached()) {
            LibraryActions.incrementPlayCount(Player.getAudio().src);
        }
    });
    Player.getAudio().addEventListener('play', () => {
        ipcRenderer.send('playerAction', 'play');
    });
    Player.getAudio().addEventListener('pause', () => {
        ipcRenderer.send('playerAction', 'pause');
    });

    // Listen for main-process events
    ipcRenderer.on('playerAction', (event, reply) => {

        switch(reply) {
            case 'play':
                player.play();
                break;
            case 'pause':
                player.pause();
                break;
            case 'prev':
                player.previous();
                break;
            case 'next':
                player.next();
                break;
        }
    });

    // Prevent some events
    window.addEventListener('dragover', (e) => {
        e.preventDefault();
    }, false);

    window.addEventListener('drop', (e) => {
        e.preventDefault();
    }, false);

    // Remember dimensions and positionning
    const currentWindow = app.browserWindows.main;

    currentWindow.on('resize', () => {
        saveBounds();
    });

    currentWindow.on('move', () => {
        saveBounds();
    });
};

const start = () => {
    ipcRenderer.send('appReady');
};

const restart = () => {
    ipcRenderer.send('appRestart');
};

const close = () => {
    app.browserWindows.main.close();
};

const minimize = () => {
    app.browserWindows.main.minimize();
};

const maximize = () => {
    app.browserWindows.main.isMaximized() ? app.browserWindows.main.unmaximize() : app.browserWindows.main.maximize();
};

const saveBounds = () => {
    const now = window.performance.now();

    if (now - self.lastFilterSearch < 250) {
        clearTimeout(self.filterSearchTimeOut);
    }

    self.lastFilterSearch = now;

    self.filterSearchTimeOut = setTimeout(() => {

        app.config.set('bounds', app.browserWindows.main.getBounds());
        app.config.saveSync();

    }, 250);
};

const initShortcuts = () => {

    // Global shortcuts - Player
    globalShortcut.register('MediaPlayPause', () => {
        player.playToggle();
    });

    globalShortcut.register('MediaPreviousTrack', () => {
        player.previous();
    });

    globalShortcut.register('MediaNextTrack', () => {
        player.next();
    });
};

export default {
    player ,
    playlists,
    library,
    settings,
    
    close,
    init,
    initShortcuts,
    maximize,
    minimize,
    restart,
    saveBounds,
    start
};