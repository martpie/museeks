import http from 'axios';

export const playToggle = () => ({
    type: 'PLAYER/PLAY_TOGGLE',
    payload: http.post('api/actions/player/playToggle')
});

export const previous = () => ({
    type: 'PLAYER/PREVIOUS',
    payload: http.post('api/actions/player/previous')
});

export const next = () => ({
    type: 'PLAYER/NEXT',
    payload: http.post('api/actions/player/next')
});
