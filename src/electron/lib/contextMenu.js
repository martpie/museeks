import { BrowserWindow, Menu } from 'electron';

import lib from '../lib';

const trackList = (data) => {
    // TODO This promise will be left unresolved if we
    // click off the context menu. Maybe this is an issue
    // for performance? Probably (hopefully) not important...
    return new Promise((resolve) => {

        // Create the context menu items
        const itemSeperator = {
            type: 'separator'
        };

        const itemCreatePlaylist = {
            label: 'Create new playlist...',
            click: () => {
                resolve({
                    reply: 'createPlaylist'
                });
            }
        };

        const itemAddToPlaylist = (elem) => ({
            label: elem.name,
            click: () => {
                resolve({
                    reply: 'addToPlaylist',
                    data: {
                        playlistId: elem._id
                    }
                });
            }
        });

        const itemNoPlaylist = {
            label: 'No playlist',
            enabled: false
        };

        const itemAddToQueue = {
            label: 'Add to queue',
            click: () => {
                resolve({
                    reply: 'addToQueue',
                });
            }
        };

        const itemPlayNext = {
            label: 'Play next',
            click: () => {
                resolve({
                    reply: 'playNext',
                });
            }
        };

        const subMenuAddToPlaylist = (submenu) => ({
            label: 'Add to playlist',
            submenu,
        });

        const itemSearchFor = (searchTerm) => ({
            label: `Search for '${searchTerm}'`,
            click: () => {
                resolve({
                    reply: 'searchFor',
                    data: {
                        search: searchTerm
                    }
                });
            }
        });

        const itemShowExplorer = {
            label: 'Show in file manager',
            click: () => {
                lib.shell.showItemInFolder(data.track.path);
            }
        };

        const itemSelectedCount = {
            label: data.selectedCount > 1 ? `${data.selectedCount} tracks selected` : `${data.selectedCount} track selected`,
            enabled: false
        };

        const itemRemoveFromPlaylist = {
            label: 'Remove from playlist',
            click: () => {
                resolve({
                    reply: 'removeFromPlaylist',
                });
            }
        };

        const getPlaylistTemplate = () => {
            return data.playlists
            ? [
                itemCreatePlaylist,
                ...(data.playlists.length > 0
                   ? [itemSeperator]
                   : []),
                ...(data.playlists.map(itemAddToPlaylist)),
            ]
            : [
                itemCreatePlaylist,
                itemSeperator,
                itemNoPlaylist,
            ];
        };

        const template = [
            itemSelectedCount,
            itemSeperator,
            ...(data.playStatus !== 'stop'
                ? [itemAddToQueue, itemPlayNext, itemSeperator]
                : []),
            subMenuAddToPlaylist(getPlaylistTemplate()),
            itemSeperator,
            itemSearchFor(data.track.artist[0]),
            itemSearchFor(data.track.album),
            itemSeperator,
            itemShowExplorer,
            ...(data.type === 'playlist'
                ? [itemRemoveFromPlaylist]
                : []),
        ];

        const menu = Menu.buildFromTemplate(template);

        menu.popup(BrowserWindow.getAllWindows()[0]);
    });
};

export default {
    trackList,
};
