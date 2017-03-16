const routes = [{
    method: 'POST',
    path: 'jumpTo'
}, {
    method: 'GET',
    path: 'next'
}, {
    method: 'GET',
    path: 'pause'
}, {
    method: 'GET',
    path: 'play'
}, {
    method: 'GET',
    path: 'playToggle'
}, {
    method: 'GET',
    path: 'previous'
}, {
    method: 'GET',
    path: 'repeat'
}, {
    method: 'GET',
    path: 'setMuted'
}, {
    method: 'POST',
    path: 'setPlaybackRate'
}, {
    method: 'POST',
    path: 'setVolume'
}, {
    method: 'GET',
    path: 'shuffle'
}, {
    method: 'GET',
    path: 'start'
}, {
    method: 'GET',
    path: 'stop'
}, {
    method: 'GET',
    path: 'audioErrors'
}];

module.exports = {
    namespace: 'player',
    routes
};
