const standardRoute = require('./utils/standardRoute');
const mapToObject = require('./utils/mapToObject');

const routeStrings = [    
    'audioError',
    'jumpTo',
    'next',
    'pause',
    'play',
    'playToggle',
    'previous',
    'repeat',
    'setMuted',
    'setPlaybackRate',
    'setVolume',
    'shuffle',
    'start',
    'stop',
    'audioErrors'
];

const routes = mapToObject(routeStrings, (route) => standardRoute(`player.${route}`));

module.exports = routes;