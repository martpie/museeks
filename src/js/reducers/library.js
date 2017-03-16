import app          from '../lib/app';
import AppConstants from '../constants/AppConstants';
import utils        from '../utils/utils';

export default (state = {}, payload) => {
    switch (payload.type) {
        case(AppConstants.APP_FILTER_SEARCH): {
            if(!payload.search) {
                const newState = { ...state };
                newState.tracks[state.tracksCursor].sub = [...state.tracks[state.tracksCursor].all];

                return newState;
            }

            const search = utils.stripAccents(payload.search);

            const allCurrentTracks = state.tracks[state.tracksCursor].all;
            const tracks = [].concat(allCurrentTracks).filter((track) => { // Problem here
                return track.loweredMetas.artist.join(', ').includes(search)
                    || track.loweredMetas.album.includes(search)
                    || track.loweredMetas.genre.join(', ').includes(search)
                    || track.loweredMetas.title.includes(search);
            });

            const newState = { ...state };
            newState.tracks[state.tracksCursor].sub = tracks;

            return newState;
        }

        case(AppConstants.APP_LIBRARY_FETCHED_COVER): {
            return {
                ...state,
                cover: payload.cover || null
            };
        }

        case(AppConstants.APP_LIBRARY_ADD_FOLDERS): {
            const folders    = payload.folders;
            let musicFolders = app.config.get('musicFolders');

            // Check if we received folders
            if(folders !== undefined) {
                musicFolders = musicFolders.concat(folders);

                // Remove duplicates, useless children, ect...
                musicFolders = utils.removeUselessFolders(musicFolders);

                musicFolders.sort();

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();
            }

            return { ...state };
        }

        case(AppConstants.APP_LIBRARY_REMOVE_FOLDER): {
            if(!state.library.refreshing) {
                const musicFolders = app.config.get('musicFolders');

                musicFolders.splice(payload.index, 1);

                app.config.set('musicFolders', musicFolders);
                app.config.saveSync();

                return { ...state };
            }

            return state;
        }

        case(AppConstants.APP_LIBRARY_RESET): {
            // nothing here for the moment
            return state;
        }

        case(AppConstants.APP_LIBRARY_REFRESH_START): {
            return {
                ...state,
                status: 'An apple a day keeps Dr Dre away',
                library: {
                    ...state.library,
                    refreshing: true
                }
            };
        }

        case(AppConstants.APP_LIBRARY_REFRESH_END): {
            return {
                ...state,
                library: {
                    refreshing: false,
                    refresh : {
                        processed: 0,
                        total: 0,
                    }
                }
            };
        }

        case(AppConstants.APP_LIBRARY_REFRESH_PROGRESS): {
            return {
                ...state,
                library: {
                    ...state.library,
                    refresh : {
                        processed: payload.processed,
                        total: payload.total,
                    }
                }
            };
        }

        case(AppConstants.APP_LIBRARY_REMOVE_TRACKS): {
            const tracksIds = payload.tracksIds;
            const removeTrack = (track) => !tracksIds.includes(track._id);
            const tracks = {
                library: {
                    all: [...state.tracks.library.all].filter(removeTrack),
                    sub: [...state.tracks.library.sub].filter(removeTrack)
                },
                playlist: {
                    all: [...state.tracks.playlist.all].filter(removeTrack),
                    sub: [...state.tracks.playlist.sub].filter(removeTrack)
                }
            };

            return {
                ...state,
                tracks,
                refreshProgress : payload.percentage
            };
        }

        case(AppConstants.APP_LIBRARY_SET_TRACKSCURSOR): {
            return {
                ...state,
                tracksCursor: payload.cursor
            };
        }

        default: {
            return state;
        }
    }
};
