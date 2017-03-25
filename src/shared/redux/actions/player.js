import utils from '../../utils/utils';
import { range } from 'range';

const library = (lib) => {

    const audioErrors = {
        aborted: 'The video playback was aborted.',
        corrupt: 'The audio playback was aborted due to a corruption problem.',
        notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
        unknown: 'An unknown error occurred.'
    };

    const getNextCursor = ({ direction }) => {
        const { queue, queueCursor, player: { repeat, shuffle, history } } = lib.store.getState();

        console.log({ direction, queue, queueCursor, repeat, shuffle, history })

        return lib.player.getAudio().then((audio) => {

            if (direction === 'previous' && !shuffle) {
                // If track started less than 5 seconds ago, play the previous track, otherwise replay the current one
                if (audio.currentTime < 5) {
                    return queueCursor - 1;
                }
                else {
                    return queueCursor;
                }
            }
            else if (direction === 'previous' && shuffle) {
                // play the previously played track, not the previous in the queue
                const currentTrack = queue[queueCursor];
                const previousTrack = history[history.length - 1];
                const previousIndex = queue.findIndex((track) => track._id === previousTrack._id);
                return previousIndex;
            }
            else if (repeat === 'one') {
                return queueCursor;
            }
            else if (shuffle) {
                const choices = range(0, queue.length).filter((choice) => choice !== queueCursor);
                return utils.pickRandom(choices);
            }
            else if (repeat === 'all' && queueCursor === queue.length - 1) { // is last track
                return 0; // start with new track
            }
            else {
                return queueCursor + 1;
            }
        });
    }

    const playToggle = () => (dispatch, getState) => {
        lib.player.getAudio().then((audio) => {
            if (audio.paused && getState().queue.length > 0) {
                dispatch(lib.actions.player.play());
            } else {
                dispatch(lib.actions.player.pause());
            }
        });
    };

    const load = (_id) => (dispatch, getState) => {
        const { queue, network: { output } } = getState();

        const queueCursor = queue.findIndex((track) => track._id === _id);
        const track = queue[queueCursor];

        if (track) {
            const outputIsLocal = () => Promise.resolve(lib.player.setMetadata(track));
            const outputIsRemote = () => lib.api.actions.player.load(output, _id);

            return dispatch({
                type: 'PLAYER/LOAD',
                payload: output.isLocal
                    ? outputIsLocal()
                    : outputIsRemote(),
                meta: {
                    queueCursor
                }
            });
        }
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

    const newQueueLoadAndPlay = (_id) => (dispatch, getState) => {
        const { tracks, tracks: { tracksCursor } } = getState();
        const newQueue = [ ...tracks[tracksCursor].sub ];

        return dispatch(lib.actions.player.createNewQueue(newQueue))
        .then(() => dispatch(lib.actions.player.loadAndPlay(_id)));
    };

    const loadAndPlay = (_id) => (dispatch, getState) => {
        dispatch(lib.actions.player.load(_id));
        dispatch(lib.actions.player.play());
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

    const createNewQueue = (newQueue) => (dispatch, getState) => {
        const { queue: oldQueue, network: { output, me } } = getState();

        const outputIsLocal = () => Promise.resolve();
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
                oldQueue
            }
        });
    }

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

    const next = () => (dispatch, getState) => {
        const { queue, network: { output } } = getState();

        const newQueueCursor = getNextCursor({ direction: 'next' });
        const track = queue[newQueueCursor];

        if (track) {

            const outputIsLocal = () => {
                lib.player.setMetadata(track);
                lib.player.play();
                return Promise.resolve();
            }
            const outputIsRemote = () => lib.api.actions.player.next(output);

            dispatch({
                type: 'PLAYER/NEXT',
                payload: output.isLocal
                    ? outputIsLocal()
                    : outputIsRemote(),
                meta: {
                    newQueueCursor
                }
            });
        } else {
            dispatch(lib.actions.player.stop());
        }
    };

    const previous = () => (dispatch, getState) => {
        const { queue } = getState();

        const newQueueCursor = getNextCursor({ direction: 'previous' });
        const track = queue[newQueueCursor];

        if (track) {

            const outputIsLocal = () => {
                lib.player.setMetadata(track);
                lib.player.play();
                return Promise.resolve();
            }
            const outputIsRemote = () => lib.api.actions.player.next(output);

            dispatch({
                type: 'PLAYER/PREVIOUS',
                payload: output.isLocal
                    ? outputIsLocal()
                    : outputIsRemote(),
                meta: {
                    newQueueCursor
                }
            });
        } else {
            dispatch(lib.actions.player.stop());
        }
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

    const jumpTo = (to) => (dispatch, getState) => {
        const { network: { output } } = getState();

        const outputIsLocal = () => Promise.resolve(lib.player.setCurrentTime(to));
        const outputIsRemote = () => lib.api.actions.player.jumpTo(output, to);

        dispatch({
            type: 'PLAYER/JUMP_TO',
            payload: output.isLocal
                ? outputIsLocal()
                : outputIsRemote()
            // meta: { prevTime, time }
        });
    };

    const audioError = (e) => (dispatch) => {
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

    const fetchCover = (metadata) => ({
        type: 'PLAYER/SET_COVER',
        payload: {
            cover: utils.coverEndpoint({
                _id: metadata._id,
                peer: metadata.owner
            })
        }
    });

    return {
        audioError,
        audioErrors,
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
        setVolume,
        shuffle,
        stop,
    };
}

export default library;
