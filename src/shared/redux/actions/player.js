import utils from '../../utils/utils';

const library = (lib) => {

    const audioErrors = {
        aborted: 'The video playback was aborted.',
        corrupt: 'The audio playback was aborted due to a corruption problem.',
        notFound: 'The track file could not be found. It may be due to a file move or an unmounted partition.',
        unknown: 'An unknown error occurred.'
    };

    const playToggle = () => (dispatch, getState) => {
        const { paused } = lib.player.audio;
        const { queue } = getState();
        if (paused && queue.length > 0) {
            dispatch(lib.actions.player.play());
        } else {
            dispatch(lib.actions.player.pause());
        }
    };

    const play = () => (dispatch, getState) => {
        const { queue } = getState();
        if (queue !== null) {
            lib.player.play();
            dispatch({
                type: 'APP_PLAYER_PLAY'
            });
        }
    };

    const pause = () => (dispatch, getState) => {
        const { queue } = getState();
        if (queue !== null) {
            lib.player.pause();
            dispatch({
                type: 'APP_PLAYER_PAUSE'
            });
        }
    };

    const start = (_id) => (dispatch, getState) => {
        const { tracks, tracksCursor } = getState();
        const queue = [...tracks[tracksCursor].sub];
        const queuePosition = queue.findIndex((track) => track._id === _id);

        if (queuePosition > -1) {
            const uri = utils.parseUri(queue[queuePosition].path);
console.log(queue[queuePosition])
            lib.player.setAudioSrc("http://localhost:54321/api/media?_id=0a0cca31");
            lib.player.play();

            dispatch({
                type: 'APP_PLAYER_START',
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
            type: 'APP_PLAYER_STOP'
        };
    };

    const next = () => (dispatch, getState) => {
        const { someState } = getState();
        if (true) {
            const uri = utils.parseUri(track.path);

            lib.player.setAudioSrc(uri);
            lib.player.play();
            dispatch({
                type: 'APP_PLAYER_NEXT',
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
            const uri = utils.parseUri(newTrack.path);

            lib.player.setAudioSrc(uri);
            lib.player.play();

            dispatch({
                type: 'APP_PLAYER_PREVIOUS',
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
        dispatch(lib.actions.config.set('audioShuffle', shuffle));

        const currentSrc = lib.player.getSrc();
        return {
            type: 'APP_PLAYER_SHUFFLE',
            payload: {
                shuffle,
                currentSrc
            }
        };
    };

    const repeat = (repeat) => (dispatch) => {
        dispatch(lib.actions.config.set('audioRepeat', repeat));

        return {
            type: 'APP_PLAYER_REPEAT',
            payload: {
                repeat
            }
        };
    };

    const setVolume = (volume) => (dispatch) => {
        if (!isNaN(parseFloat(volume)) && isFinite(volume)) {
            lib.player.setAudioVolume(volume);

            dispatch(lib.actions.config.set('audioVolume', volume));
        }
    };

    const setMuted = (muted = false) => (dispatch) => {
        if (muted) lib.player.mute();
        else lib.player.unmute();

        dispatch(lib.actions.config.set('audioMuted', muted));
    };

    const setPlaybackRate = (value) => (dispatch) => {
        if (!isNaN(parseFloat(value)) && isFinite(value)) { // if is numeric
            if (value >= 0.5 && value <= 5) { // if in allowed range
                lib.player.setAudioPlaybackRate(value);

                dispatch(lib.actions.config.set('audioPlaybackRate', parseFloat(value)));
            }
        }
    };

    const jumpTo = (to) => {
        lib.player.setAudioCurrentTime(to);
        return {
            type: 'APP_PLAYER_JUMP_TO'
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
