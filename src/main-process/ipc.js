'use strict';

const { Menu, ipcMain } = require('electron');

class IpcManager {
    constructor(window) {
        this.window = window;
    }

    bindEvents() {
        ipcMain.on('tracksListContextMenu', (event, data) => {

            let options = JSON.parse(data);
            let playlistTemplate;

            if(!!options.playlists) {

                playlistTemplate = [
                    {
                        label: 'Create new playlist...',
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'createPlaylist');
                        }
                    },
                    {
                        type: 'separator'
                    }
                ];

                options.playlists.forEach((elem) => {
                    playlistTemplate.push({
                        label: elem.name,
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'addToPlaylist', elem._id);
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

            let template = [
                {
                    label: options.selectedCount > 1 ? options.selectedCount + ' tracks selected' : options.selectedCount + ' track selected',
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

            let context = Menu.buildFromTemplate(template);

            context.popup(this.window); // Let it appear
        });


        ipcMain.on('playlistContextMenu', (event, _id) => {

            let template = [
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

            let context = Menu.buildFromTemplate(template);

            context.popup(this.window); // Let it appear
        });


        ipcMain.on('toggleSleepBlocker', (event, toggle, mode) => {

            if(toggle) {
                instance.sleepBlockerID = powerSaveBlocker.start(mode);
            } else {
                powerSaveBlocker.stop(instance.sleepBlockerID);
                delete(instance.sleepBlockerID);
            }
        });


        ipcMain.on('appReady', (event, toggle, mode) => {
            this.window.show();
        });

        this.window.on('closed', () => {
            // Dereference the window object
            this.window = null;
        });
    }
}

module.exports = IpcManager;
