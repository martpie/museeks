import { BrowserWindow, Menu } from 'electron';

import lib from '../lib';

const trackList = (data) => {
    // TODO This promise will be left unresolved if we
    // click off the context menu. Maybe this is an issue
    // for performance? Probably nor important;
    return new Promise((resolve, reject) => {

        // Create the context menu items
        const itemSeperator = {
            type: 'separator'
        };

        const itemCreatePlaylist = {
            label: 'Create new playlist...',
            click: () => {
                resolve('createPlaylist');
            }
        };

        const itemAddToPlaylist = (elem) => ({
            label: elem.name,
            click: () => {
                resolve('addToPlaylist', {
                    playlistId: elem._id
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
                resolve('addToQueue');
            }
        };

        const itemPlayNext = {
            label: 'Play next',
            click: () => {
                resolve('playNext');
            }
        };

        const getPlaylistTemplate = () => {
            let template = [];
            if (data.playlists) {
                template = [ itemCreatePlaylist ];

                if (data.playlists.length > 0) {
                    template.push(itemSeperator);
                }
                data.playlists.forEach((elem) => {
                    template.push(itemAddToPlaylist(elem));
                });
            } else {
                template = [
                    itemCreatePlaylist,
                    itemSeperator,
                    itemNoPlaylist,
                ];
            }
            return template;
        };

        const getaddToQueueTemplate = () => {
            return data.playStatus !== 'stop'
            ? [
                itemAddToQueue,
                itemPlayNext,
                itemSeperator,
            ]
            : [];
        };

        const subMenuAddToPlaylist = {
            label: 'Add to playlist',
            submenu: getPlaylistTemplate()
        };

        const itemSearchFor = (searchTerm) => ({
            label: `Search for '${searchTerm}'`,
            click: () => {
                resolve('searchFor', { search: searchTerm });
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
                resolve('removeFromPlaylist');
            }
        };

        const template = [
            itemSelectedCount,
            itemSeperator,
            ...getaddToQueueTemplate(),
            subMenuAddToPlaylist,
            itemSeperator,
            itemSearchFor(data.track.artist[0]),
            itemSearchFor(data.track.album),
            itemSeperator,
            itemShowExplorer,
        ];

        if (data.type === 'playlist') template.push(itemRemoveFromPlaylist);

        const menu = Menu.buildFromTemplate(template);

        menu.popup(BrowserWindow.getAllWindows()[0]);
    });
};

export default {
    trackList,
}
