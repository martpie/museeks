import utils from '../../utils/utils';

const library = (lib) => {

    const setState = (state) => (dispatch, getState) => {
        dispatch({
            type: 'PLAYER/SET_STATE',
            payload: {
                state
            }
        });

        // Set the queue - TODO: remove when queue is on player
        dispatch(lib.actions.queue.setQueue(state.queue));

        // Set the queue cursor - TODO: remove when queueCursor is on player
        dispatch(lib.actions.queue.setQueueCursor(state.queueCursor));

        // Set audio element play state: can be play/pause/stop
        dispatch(lib.actions.player[state.playStatus]());

        // Set audio element repeat
        dispatch(lib.actions.player.repeat(state.repeat));

        // Set audio element suffle
        dispatch(lib.actions.player.shuffle(state.shuffle));

        // Set audio element elapsed time
        dispatch(lib.actions.player.jumpTo(state.elapsed));

        dispatch(lib.actions.player.load());
    }

    const load = (data = {}) => (dispatch, getState) => {

        const state = getState();

        const {
            queueCursor: oldQueueCursor,
            tracks: { library : { data: tracks }},
            player: { currentTrack: oldCurrentTrack, history, historyCursor: oldHistoryCursor },
            network: { output }
        } = state;

        // if our queue and _id have been supplied directly
        const { _id } = data;
        const queue = data.queue || state.queue;

        const queueCursor = isNaN(data.queueCursor)
            ? queue.indexOf(_id)
            : data.queueCursor;

        const historyCursor = isNaN(data.historyCursor)
            ? oldHistoryCursor
            : data.historyCursor;

        const inHistory = historyCursor !== -1;

        const cursorNextTrackId = inHistory
            ? history[historyCursor]
            : queue[queueCursor];

        // use the user supplied _id, or fall back to cursor
        const currentTrack = tracks[_id || cursorNextTrackId];

        if (currentTrack) {
            const outputIsLocal = () => Promise.all([
                lib.player.setMetadata(currentTrack),
                lib.player.setCurrentTime(0)
            ]);
            const outputIsRemote = () => lib.api.actions.player.load(output, data);

            dispatch({
                type: 'PLAYER/LOAD',
                payload: output.isLocal
                    ? outputIsLocal()
                    : outputIsRemote(),
                meta: {
                    currentTrack,
                    queueCursor,
                    historyCursor,
                    oldCurrentTrack,
                    oldQueueCursor,
                    oldHistoryCursor
                }
            });

        } else {
            dispatch(lib.actions.player.stop());
        }
    };

    const loadAndPlay = (data) => (dispatch, getState) => {
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
        const { queue , network: { output } } = getState();

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
        const { player: { playStatus }, network: { output } } = getState();

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
        lib.player.getAudio().then((audio) => {
            if (audio.paused && getState().queue.length > 0) {
                dispatch(lib.actions.player.play());
            } else {
                dispatch(lib.actions.player.pause());
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

    const next = (data = {}) => (dispatch, getState) => {
        const {
            queue,
            queueCursor,
            player: { history, historyCursor, repeat, shuffle },
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

        dispatch({
            type: 'PLAYER/NEXT',
            meta: {
                historyCursor: cursors.historyCursor,
                oldHistoryCursor: historyCursor
            }
        });

        dispatch(lib.actions.player.loadAndPlay(cursors));
    };

    const previous = (data = {}) => (dispatch, getState) => {
        const {
            queue,
            queueCursor,
            player: { history, historyCursor, repeat, shuffle },
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

            dispatch({
                type: 'PLAYER/PREVIOUS'
            });

            dispatch(lib.actions.player.loadAndPlay(cursors));
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

        return {
            type: 'PLAYER/REPEAT',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: {
                prevRepeat,
                repeat
            }
        };
    };

    const setVolume = (volume) => (dispatch) => {
        if (!isNaN(parseFloat(volume)) && isFinite(volume)) {
            lib.player.setVolume(volume);

            dispatch(lib.actions.config.set('volume', volume));
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

    const jumpTo = (time) => (dispatch, getState) => {
        const { network: { output }, player: { elapsed: prevTime } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.player.setCurrentTime(time));
        const outputIsRemote = () => lib.api.actions.player.jumpTo(output, time);

        dispatch({
            type: 'PLAYER/JUMP_TO',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote(),
            meta: { prevTime, time }
        });
    };

    const updateElapsedTime = (time) => ({
        type: 'PLAYER/UPDATE_ELAPSED_TIME',
        payload: time
    });

    const fetchCover = (metadata) => ({
        type: 'PLAYER/SET_COVER',
        payload: {
            cover: utils.coverEndpoint({
                _id: metadata._id,
                peer: metadata.owner
            })
        }
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
            network: { output, me }
        } = getState();

        const outputIsLocal = () => new Promise((resolve) => setTimeout(resolve, 2));
        const outputIsRemote = () => {
            const remoteQueue = utils.transformTrackPaths({
                tracks: newQueue,
                peer: output,
                me
            });
            return lib.api.actions.player.createNewQueue(output, remoteQueue);
        }

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
    }

    return {
        audioError,
        createNewQueue,
        fetchCover,
        jumpTo,
        load,
        loadAndPlay,
        newQueueLoadAndPlay,
        next,
        pause,
        play,
        playToggle,
        previous,
        repeat,
        setMuted,
        setPlaybackRate,
        setQueueCursor,
        setState,
        setVolume,
        fetchCover,
        updateElapsedTime,
        audioError,
        createNewQueue
    };
}

export default library;
