const { Menu, ipcMain, powerSaveBlocker } = require('electron');

class IpcManager {
    constructor(window) {
        this.window = window;
        this.instance = {};
    }

    bindEvents() {

        ipcMain.on('tracksListContextMenu', (event, data) => {

            const options = JSON.parse(data);
            let playlistTemplate;

            if(options.playlists) {

                playlistTemplate = [
                    {
                        label: 'Create new playlist...',
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'createPlaylist');
                        }
                    }
                ];

                if(options.playlists.length > 0) {
                    playlistTemplate.push(
                        {
                            type: 'separator'
                        }
                    );
                }

                options.playlists.forEach((elem) => {
                    playlistTemplate.push({
                        label: elem.name,
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'addToPlaylist', { playlistId: elem._id });
                        }
                    });
                });

            } else {

                playlistTemplate = [
                    {
                        label: 'Create new playlist...',
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'createPlaylist');
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'No playlist',
                        enabled: false
                    }
                ];
            }

            const template = [
                {
                    label: options.selectedCount > 1 ? `${options.selectedCount} tracks selected` : `${options.selectedCount} track selected`,
                    enabled: false
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Add to queue',
                    click: () => {
                        event.sender.send('tracksListContextMenuReply', 'addToQueue');
                    }
                },
                {
                    label: 'Play next',
                    click: () => {
                        event.sender.send('tracksListContextMenuReply', 'playNext');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Add to playlist',
                    submenu: playlistTemplate
                }
            ];

            if(options.type === 'playlist') template.push({
                label: 'Remove from playlist',
                click: () => {
                    event.sender.send('tracksListContextMenuReply', 'removeFromPlaylist');
                }
            });

            const context = Menu.buildFromTemplate(template);

            context.popup(this.window); // Let it appear
        });


        ipcMain.on('playlistContextMenu', (event, _id) => {

            const template = [
                {
                    label: 'Delete',
                    click: () => {
                        event.sender.send('playlistContextMenuReply', 'delete', _id);
                    }
                },
                {
                    label: 'Rename',
                    click: () => {
                        event.sender.send('playlistContextMenuReply', 'rename', _id);
                    }
                }
            ];

            const context = Menu.buildFromTemplate(template);

            context.popup(this.window); // Let it appear
        });


        ipcMain.on('toggleSleepBlocker', (event, toggle, mode) => {

            if(toggle) {
                this.instance.sleepBlockerId = powerSaveBlocker.start(mode);
            } else {
                powerSaveBlocker.stop(this.instance.sleepBlockerId);
                delete(this.instance.sleepBlockerId);
            }
        });


        ipcMain.on('appReady', () => {
            this.window.show();
        });


        this.window.on('closed', () => {
            // Dereference the window object
            this.window = null;
        });
    }
}

module.exports = IpcManager;
