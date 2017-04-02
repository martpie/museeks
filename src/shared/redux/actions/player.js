import utils from '../../utils/utils';

const library = (lib) => {
    const setState = (state) => (dispatch) => {
        const {
            currentTrack,
            playStatus,
            queue,
            repeat,
            shuffle,
            volume,
            elapsed
        } = state;

        // Set the queue
        dispatch(lib.actions.player.createNewQueue(queue));

        // Set audio element repeat
        dispatch(lib.actions.player.repeat(repeat));

        // Set audio element shuffle
        dispatch(lib.actions.player.shuffle(shuffle));

        // Set audio element elapsed time
        dispatch(lib.actions.player.jumpTo({ time: elapsed }));

        // Set the volume
        dispatch(lib.actions.player.setVolume(volume));

        // Load the track
        dispatch(lib.actions.player.load({ queue, _id: currentTrack._id }));

        // Set audio element play state: can be play/pause/stop
        dispatch(lib.actions.player[playStatus]());
    };

    const load = (data = {}) => (dispatch, getState) => {
        const state = getState();

        const {
            queueCursor: oldQueueCursor,
            tracks: { library : { data: tracks } },
            player: { currentTrack: oldCurrentTrack, history, historyCursor: oldHistoryCursor },
            network: { output }
        } = state;

        // if our queue and _id have been supplied directly
        const { _id } = data;
        const queue = data.queue || state.queue;

        const getQueueCursor = () => {
            if (_id) {
                // we've been given a track to play
                return queue.indexOf(_id);
            } else if (utils.isNumber(data.queueCursor)) {
                // we've been given a queue cursor
                return data.queueCursor;
            } else if (data.queueCursor === null) {
                // move to the head of the queue
                return 0;
            } else if (data.queueCursor === undefined && oldQueueCursor === null) {
                // move to the head of the queue
                return 0;
            } else {
                // pick the existing state's queue cursor
                return oldQueueCursor;
            }
        };

        // if we haven't been given a queue cursor
        const queueCursor = getQueueCursor();

        // use the supplied history cursor, or pick the existing state's history cursor
        const historyCursor = data.historyCursor !== undefined
            ? data.historyCursor
            : oldHistoryCursor;

        const inHistory = historyCursor > -1 || historyCursor === null;

        // only index the history if we're in history and haven't been given a song to play
        const shouldPlayFromHistory = inHistory && !_id;

        const cursorNextTrackId = shouldPlayFromHistory
            ? history[historyCursor]
            : queue[queueCursor];

        // use the user supplied _id, or fall back to cursor
        const currentTrack = tracks[_id || cursorNextTrackId];

        if (currentTrack) {
            const outputIsLocal = () => Promise.resolve(lib.player.setMetadata(currentTrack));
            const outputIsRemote = () => lib.api.actions.player.load(output, data);

            dispatch(lib.actions.player.jumpTo({ time: 0 }));

            dispatch({
                type: 'PLAYER/LOAD',
                payload: output.isLocal
                    ? outputIsLocal()
                    : outputIsRemote(),
                meta: {
                    currentTrack,
                    queueCursor,
                    historyCursor: shouldPlayFromHistory
                        ? historyCursor
                        : -1,
                    oldCurrentTrack,
                    oldQueueCursor,
                    oldHistoryCursor,
                    queue
                }
            });
        } else {
            dispatch(lib.actions.player.setCursors({ queueCursor, historyCursor }));
            dispatch(lib.actions.player.stop());
        }
    };

    const loadAndPlay = (data) => (dispatch) => {
        dispatch(lib.actions.player.load(data));
        dispatch(lib.actions.player.play());
    };

    const newQueueLoadAndPlay = (_id) => (dispatch, getState) => {
        const { tracks, tracks: { tracksCursor } } = getState();

        const queue = tracks[tracksCursor].sub;

        return dispatch(lib.actions.player.createNewQueue(queue)).then(() => {
            return dispatch(lib.actions.player.loadAndPlay({ _id, queue }));
        });
    };

    const play = () => (dispatch, getState) => {
        const { queue, network: { output } } = getState();

        // lib.store.dispatch(lib.actions.player.nowPlaying(track));
        //
        // if (!this.lib.app.browserWindows.main.isFocused()) {
        //     return lib.actions.network.fetchCover(track.path).then((cover) => {
        //         return NotificationActions.add({
        //             title: track.title,
        //             body: `${track.artist}\n${track.album}`,
        //             icon: cover
        //         });
        //     });
        // }

        if (queue === null) return;

        const outputIsLocal = () => Promise.resolve(lib.player.play());
        const outputIsRemote = () => lib.api.actions.player.play(output);

        return dispatch({
            type: 'PLAYER/PLAY',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote()
        });
    };

    const pause = () => (dispatch, getState) => {
        const { network: { output } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.player.pause());
        const outputIsRemote = () => lib.api.actions.player.pause(output);

        return dispatch({
            type: 'PLAYER/PAUSE',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote()
        });
    };

    const playToggle = () => (dispatch, getState) => {
        const {
            queue: existingQueue,
            queueCursor,
            player: { playStatus, history, historyCursor, repeat, shuffle },
            tracks: { library: { sub: filteredTracks } }
        } = getState();

        console.log('PLAY STSTUS', playStatus);

        switch (playStatus) {
            case ('stop'): {
                const queue = existingQueue.length === 0 // if we have no queue, create one from the filtered list
                    ? filteredTracks
                    : existingQueue;

                const cursors = historyCursor === null || queueCursor === null
                    ? utils.getNextQueueCursor({
                        direction: 'next',
                        queue,
                        queueCursor,
                        history,
                        historyCursor,
                        repeat,
                        shuffle
                    })
                    : {
                        historyCursor,
                        queueCursor
                    };

                return dispatch(lib.actions.player.loadAndPlay({
                    queue,
                    ...cursors
                }));
            }
            case ('pause'): {
                return dispatch(lib.actions.player.play());
            }
            default: {
                return dispatch(lib.actions.player.pause());
            }
        }
    };

    const next = () => (dispatch, getState) => {
        const {
            queue,
            queueCursor,
            player: { history, historyCursor, repeat, shuffle, playStatus }
        } = getState();

        const cursors = utils.getNextQueueCursor({
            direction: 'next',
            queue,
            queueCursor,
            history,
            historyCursor,
            repeat,
            shuffle
        });

        // stop playback if we have no next queue cursor
        if (cursors.queueCursor === null) {
            dispatch(lib.actions.player.stop());
        } else {
            dispatch({
                type: 'PLAYER/NEXT'
            });

            dispatch(lib.actions.player.load(cursors));

            if (playStatus === 'stop') {
                // set the track as paused so the track details are displayed
                dispatch(lib.actions.player.pause());
            } else {
                // apply the existing play status
                dispatch(lib.actions.player[playStatus]());
            }
        }
    };

    const previous = () => (dispatch, getState) => {
        const {
            queue,
            queueCursor,
            player: { history, historyCursor, repeat, shuffle, playStatus }
        } = getState();

        lib.player.getAudio().then(({ currentTime }) => {
            const cursors = utils.getNextQueueCursor({
                direction: 'previous',
                queue,
                queueCursor,
                history,
                historyCursor,
                repeat,
                shuffle,
                currentTime
            });

            // stop playback if we've gone past the head of the history
            dispatch({
                type: 'PLAYER/PREVIOUS'
            });

            dispatch(lib.actions.player.load(cursors));

            if (playStatus === 'stop') {
                // set the track as paused so the track details are displayed
                dispatch(lib.actions.player.pause());
            } else if (cursors.historyCursor !== null) {
                // apply the existing play status
                dispatch(lib.actions.player[playStatus]());
            }
        });
    };

    const stop = () => (dispatch, getState) => {
        const { network: { output } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.player.stop());
        const outputIsRemote = () => lib.api.actions.player.stop(output);

        return dispatch({
            type: 'PLAYER/STOP',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote()
        });
    };

    const shuffle = (shuffle) => (dispatch, getState) => {
        const { player: { shuffle: prevShuffle }, network: { output } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.actions.config.set('shuffle', shuffle));
        const outputIsRemote = () => lib.api.actions.player.shuffle(output, shuffle);

        return dispatch({
            type: 'PLAYER/SHUFFLE',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                prevShuffle,
                shuffle
            }
        });
    };

    const repeat = (repeat) => (dispatch, getState) => {
        const { player: { repeat: prevRepeat }, network: { output } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.actions.config.set('repeat', repeat));
        const outputIsRemote = () => lib.api.actions.player.repeat(output, repeat);

        return dispatch({
            type: 'PLAYER/REPEAT',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                prevRepeat,
                repeat
            }
        });
    };

    const setCursors = (cursors) => (dispatch) => {
        dispatch({
            type: 'PLAYER/SET_CURSORS',
            payload: cursors
        });
    };

    const setVolume = (volume) => (dispatch, getState) => {
        if (!isNaN(parseFloat(volume)) && isFinite(volume)) {
            const { player: { volume: oldVolume }, network: { output } } = getState();

            const outputIsLocal = () => Promise.resolve();
            const outputIsRemote = () => lib.api.actions.player.setVolume(output, volume);

            lib.player.setVolume(volume);
            dispatch(lib.actions.config.set('volume', volume, 300));

            // Set the volume state for the UI
            // We do this directly (no promise) for speed.
            dispatch({
                type: 'PLAYER/SET_VOLUME',
                payload: volume,
            });

            // This async part is throttled so observers
            // are not updated too often.
            return dispatch({
                type: 'PLAYER/SET_VOLUME',
                payload: output.isLocal
                    ? outputIsLocal()
                    : outputIsRemote(),
                meta: {
                    volume,
                    oldVolume,
                    throttle: 100
                },
            });
        }
    };

    const setMuted = (muted = false) => (dispatch) => {
        if (muted) lib.player.mute();
        else lib.player.unmute();

        dispatch(lib.actions.config.set('muted', muted));
    };

    const setPlaybackRate = (value) => (dispatch) => {
        if (!isNaN(parseFloat(value)) && isFinite(value)) { // if is numeric
            if (value >= 0.5 && value <= 5) { // if in allowed range
                lib.player.setPlaybackRate(value);

                dispatch(lib.actions.config.set('playbackRate', parseFloat(value)));
            }
        }
    };

    const jumpTo = ({ time }) => (dispatch, getState) => {
        const { network: { output }, player: { elapsed: prevTime } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.player.setCurrentTime(time));
        const outputIsRemote = () => lib.api.actions.player.jumpTo(output, { time });

        dispatch({
            type: 'PLAYER/JUMP_TO',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                time,
                prevTime
            }
        });
    };

    const updateElapsedTime = (time) => ({
        type: 'PLAYER/UPDATE_ELAPSED_TIME',
        payload: time
    });

    const audioError = (e) => (dispatch) => {
        const audioErrors = {
            aborted: 'The video playback was aborted.',
            corrupt: 'The audio playback was aborted due to a corruption problem.',
            notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
            unknown: 'An unknown error occurred.'
        };

        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                dispatch(lib.actions.toasts.add('warning', audioErrors.aborted));
                break;
            case e.target.error.MEDIA_ERR_DECODE:
                dispatch(lib.actions.toasts.add('danger', audioErrors.corrupt));
                break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                dispatch(lib.actions.toasts.add('danger', audioErrors.notFound));
                break;
            default:
                dispatch(lib.actions.toasts.add('danger', audioErrors.unknown));
                break;
        }
    };

    const createNewQueue = (newQueue) => (dispatch, getState) => {
        const {
            queue: oldQueue,
            queueCursor: oldQueueCursor,
            network: { output }
        } = getState();

        const outputIsLocal = () => new Promise((resolve) => setTimeout(resolve, 2));
        const outputIsRemote = () => lib.api.actions.player.createNewQueue(output, newQueue);

        return dispatch({
            type: 'PLAYER/CREATE_NEW_QUEUE',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                newQueue,
                oldQueue,
                oldQueueCursor
            }
        });
    };

    const setMetadata = (metadata) => ({
        type: 'PLAYER/SET_METADATA',
        payload: {
            metadata
        }
    });

    return {
        setState,
        load,
        loadAndPlay,
        newQueueLoadAndPlay,
        play,
        pause,
        playToggle,
        next,
        previous,
        stop,
        shuffle,
        repeat,
        setCursors,
        setVolume,
        setMuted,
        setPlaybackRate,
        jumpTo,
        updateElapsedTime,
        audioError,
        createNewQueue,
        setMetadata
    };
};

export default library;
