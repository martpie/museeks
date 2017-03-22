import utils from '../../utils/utils';

const library = (lib) => {

    const audioErrors = {
        aborted: 'The video playback was aborted.',
        corrupt: 'The audio playback was aborted due to a corruption problem.',
        notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
        unknown: 'An unknown error occurred.'
    };

    const playToggle = () => (dispatch, getState) => {
        const { paused } = lib.player.audio; // TODO Jackson
        const { queue } = getState();
        if (paused && queue.length > 0) {
            dispatch(lib.actions.player.play());
        } else {
            dispatch(lib.actions.player.pause());
        }
    };

    const play = () => (dispatch, getState) => {
        const { queue } = getState();

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

        if (queue !== null) {
            lib.player.play();
            dispatch({
                type: 'PLAYER/PLAY'
            });
        }
    };

    const pause = () => (dispatch, getState) => {
        const { queue } = getState();
        if (queue !== null) {
            lib.player.pause();
            dispatch({
                type: 'PLAYER/PAUSE'
            });
        }
    };

    const start = (_id) => (dispatch, getState) => {
        const { tracks, tracksCursor } = getState();
        const queue = [...tracks[tracksCursor].sub];
        const queuePosition = queue.findIndex((track) => track._id === _id);

        if (queuePosition > -1) {
            const uri = utils.parseUri(queue[queuePosition].path);
            console.log(lib)
            console.log()
            lib.player.setMetadata(queue[queuePosition]);
            lib.player.play();

            dispatch({
                type: 'PLAYER/START',
                payload: {
                    queuePosition,
                    _id
                }
            });
        }
    };

    const stop = () => {
        lib.player.stop();
        return {
            type: 'PLAYER/STOP'
        };
    };

    const next = () => (dispatch, getState) => {
        // TODO (y.solovyov | KeitIG): calling getState is a hack.
        const { queue, queueCursor, repeat } = getState();
        let newQueueCursor;

        if(repeat === 'one') {
            newQueueCursor = queueCursor;
        } else if (repeat === 'all' && queueCursor === queue.length - 1) { // is last track
            newQueueCursor = 0; // start with new track
        } else {
            newQueueCursor = queueCursor + 1;
        }

        const track = queue[newQueueCursor];

        if (track !== undefined) {
            lib.player.setMetadata(track);
            lib.player.play();
            dispatch({
                type: 'PLAYER/NEXT',
                payload: {
                  newQueueCursor
                }
            });
        } else {
            dispatch(lib.actions.player.stop());
        }
    };

    const previous = () => (dispatch, getState) => {
        const { queue, queueCursor } = getState();
        const currentTime = lib.player.getCurrentTime();

        // If track started less than 5 seconds ago, play the previous track,
        // otherwise replay the current one
        const newQueueCursor = currentTime < 5
            ? queueCursor - 1
            : queueCursor;

        const newTrack = queue[newQueueCursor];

        if (newTrack !== undefined) {
            lib.player.setMetadata(newTrack);
            lib.player.play();

            dispatch({
                type: 'PLAYER/PREVIOUS',
                payload: {
                    currentTime,
                    newQueueCursor
                }
            });
        } else {
            dispatch(lib.actions.player.stop());
        }
    };

    const shuffle = (shuffle) => (dispatch) => {
        dispatch(lib.actions.config.set('shuffle', shuffle));

        const currentSrc = lib.player.getSrc();
        return {
            type: 'PLAYER/SHUFFLE',
            payload: {
                shuffle,
                currentSrc
            }
        };
    };

    const repeat = (repeat) => (dispatch) => {
        dispatch(lib.actions.config.set('repeat', repeat));

        return {
            type: 'PLAYER/REPEAT',
            payload: {
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

    const jumpTo = (to) => {
        lib.player.setAudioCurrentTime(to);
        return {
            type: 'PLAYER/JUMP_TO'
        };
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

    return {
        audioError,
        jumpTo,
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
        start,
        stop,
        audioErrors
    };
}

export default library;
