'use strict';

const { Menu, ipcMain, powerSaveBlocker, shell, app } = require('electron');

class IpcManager {
    constructor(window) {
        this.window = window;
        this.instance = {};
    }

    bindEvents() {
        ipcMain.on('tracksListContextMenu', (event, stringData) => {
            const data = JSON.parse(stringData);
            let playlistTemplate = [];
            let addToQueueTemplate = [];

            if(data.playlists) {
                playlistTemplate = [
                    {
                        label: 'Create new playlist...',
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'createPlaylist');
                        }
                    }
                ];

                if(data.playlists.length > 0) {
                    playlistTemplate.push(
                        {
                            type: 'separator'
                        }
                    );
                }

                data.playlists.forEach((elem) => {
                    playlistTemplate.push({
                        label: elem.name,
                        click: () => {
                            event.sender.send('tracksListContextMenuReply', 'addToPlaylist', {
                                playlistId: elem._id
                            });
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

            if(data.playerStatus !== 'stop') {
                addToQueueTemplate = [
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
                    }
                ];
            }

            const template = [
                {
                    label: data.selectedCount > 1 ? `${data.selectedCount} tracks selected` : `${data.selectedCount} track selected`,
                    enabled: false
                },
                {
                    type: 'separator'
                },
                ...addToQueueTemplate,
                {
                    label: 'Add to playlist',
                    submenu: playlistTemplate
                },
                {
                    type: 'separator'
                },
                {
                    label: `Search for "${data.track.artist[0]}"`,
                    click: () => {
                        event.sender.send('tracksListContextMenuReply', 'searchFor', { search: data.track.artist[0] });
                    }
                },
                {
                    label: `Search for "${data.track.album}"`,
                    click: () => {
                        event.sender.send('tracksListContextMenuReply', 'searchFor', { search: data.track.album });
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Show in file manager',
                    click: () => {
                        shell.showItemInFolder(data.track.path);
                    }
                },
                {
                    label: 'Remove from library',
                    click: () => {
                        event.sender.send('tracksListContextMenuReply', 'removeFromLibrary');
                    }
                }
            ];

            if(data.type === 'playlist') template.push({
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

        ipcMain.on('appRestart', () => {
            app.relaunch({ args: process.argv.slice(1) + ['--relaunch'] });
            app.exit(0);
        });


        this.window.on('closed', () => {
            // Dereference the window object
            this.window = null;
        });

        this.window.on('close', (e) => {
            e.preventDefault();
            this.window.webContents.send('close');
        });
    }
}

module.exports = IpcManager;
