'use strict';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Museeks = React.createClass({displayName: "Museeks",

    getInitialState: function () {
        return {
            library       :  null, // All tracks
            tracks        :  null, // All tracks shown on the view
            playlist      :  [],   // Tracks to be played
            trackPlaying  :  null, // The track actually playing
            view          :  views.libraryList, // The actual view
            playerStatus  : 'pause', // Player status
            notifications :  {} // The array of notifications
        }
    },

    componentWillMount: function () {
        this.refreshLibrary();
    },

    render: function () {

        var status        = this.getStatus();
        var notifications = this.state.notifications;

        var notificationsBlock = Object.keys(notifications).reverse().map(function(id, i) {
            return (
                React.createElement(Alert, {key:  id, bsStyle:  notifications[id].type, className:  'notification' }, 
                     notifications[id].content
                )
            );
        });


        return (
            React.createElement("div", {className: 'main'}, 
                React.createElement(Header, {playerStatus:  this.state.playerStatus, playlist:  this.state.playlist, trackPlaying:  this.state.trackPlaying}), 
                React.createElement("div", {className: 'main-content'}, 
                    React.createElement("div", {className: 'alerts-container'}, 
                        React.createElement(ReactCSSTransitionGroup, {transitionName: "notification"}, 
                             notificationsBlock 
                        )
                    ), 
                    React.createElement(Row, {className: 'content'}, 
                        React.createElement(this.state.view, {
                            tracks:  this.state.tracks, 
                            library:  this.state.library, 
                            trackPlaying:  this.state.trackPlaying}
                        )
                    )
                ), 
                React.createElement(Footer, {status:  status })
            )
        );
    },

    getStatus: function (status) {

        return 'an Apple a day, keeps Dr Dre away';
    },

    refreshLibrary: function() {

        var self = this;

        // Sort tracks by Artist -> year -> album -> disk -> track
        db.find({}).sort({ lArtist: 1, year: 1, album: 1, disk: 1, track: 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {
                self.setState({
                    library :  tracks,
                    tracks  :  tracks
                });
            }
        });
    },

    filterSearch: function (search) {

        var library = this.state.library;
        var tracks  = [];

        for(var i = 0; i < library.length; i++) {

            var track = library[i];

            if(search != '' && search != undefined) {

                if(track.lArtist.indexOf(search) === -1
                    && track.album.toLowerCase().indexOf(search) === -1
                    && track.genre.join(', ').toLowerCase().indexOf(search) === -1
                    && track.title.toLowerCase().indexOf(search) === -1) {

                    continue;

                } else {
                    tracks.push(track);
                }

            } else {
                tracks.push(track);
            }
        }

        this.setState({ tracks : tracks });
    },

    selectAndPlay: function(id) {

        var tracks   = this.state.tracks;
        var playlist = [];

        for (var i = id + 1; i < tracks.length; i++) {
            playlist.push(tracks[i]);
        }

        audio.src = 'file://' + tracks[id].path;
        audio.play();

        audio.addEventListener('ended', Instance.player.next);

        this.setState({
            trackPlaying :  id,
            playerStatus : 'play',
            playlist     :  playlist
        });
    },

    player: {

        play: function () {

            if(Instance.state.trackPlaying == null) {

                // to-do

            } else {

                Instance.setState({ playerStatus: 'play' });
                audio.play();
            }
        },

        pause: function () {

            Instance.setState({ playerStatus: 'pause' });
            audio.pause();
        },

        next: function (e) {

            if(e !== undefined) e.target.removeEventListener(e.type);

            var newTrackPlaying = Instance.state.trackPlaying + 1;
            var newTrack        = Instance.state.tracks[newTrackPlaying];
            var playlist        = Instance.state.playlist;

            playlist.shift();

            if (newTrack !== undefined) {

                audio.src = newTrack.path;
                audio.play();

                Instance.setState({
                    trackPlaying : newTrackPlaying,
                    playlist     : playlist
                });

            } else {

                audio.pause();
                audio.src = '';
                Instance.setState({ trackPlaying: null });
            }
        },

        previous: function () {

            if (audio.currentTime < 5) {

                var newTrackPlaying = Instance.state.trackPlaying - 1;

            } else {

                var newTrackPlaying = Instance.state.trackPlaying;
            }

            var newTrack = Instance.state.tracks[newTrackPlaying];

            if (newTrack !== undefined) {

                audio.src = newTrack.path;
                audio.play();

                Instance.setState({ trackPlaying: newTrackPlaying });

            } else {

                Instance.setState({ trackPlaying: null });
            }
        },

        stop: function () {

            audio.pause();

            Instance.setState({
                library       :  null,
                tracks        :  null,
                trackPlaying  :  null,
            });
        }
    }
});



/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

var Header = React.createClass({displayName: "Header",

    getInitialState: function () {
        return {
            showVolume :   false,
            showPlaylist : false
        }
    },

    render: function () {

        if (this.props.playerStatus == 'play') {
            var playButton = (
                React.createElement(Button, {bsSize: "small", bsStyle: "link", className: 'play', onClick:  this.pause}, 
                    React.createElement("i", {className: 'fa fa-fw fa-pause'})
                )
            );
        } else if (this.props.playerStatus == 'pause') {
            var playButton = (
                React.createElement(Button, {bsSize: "small", bsStyle: "link", className: 'play', onClick:  this.play}, 
                    React.createElement("i", {className: 'fa fa-fw fa-play'})
                )
            );
        }

        return (
            React.createElement("header", {className: 'row'}, 
                React.createElement(Col, {sm: 3, className: 'player-controls text-center'}, 
                    React.createElement(ButtonGroup, {className: 'win-controls'}, 
                        React.createElement(Button, {bsSize: "small", bsStyle: "link", className: 'win-close', onClick:  this.win.close}, "×")
                    ), 
                    React.createElement(ButtonGroup, null, 
                        React.createElement(Button, {bsSize: "small", bsStyle: "link", onClick:  this.previous}, 
                            React.createElement("i", {className: 'fa fa-fw fa-backward'})
                        ), 
                         playButton, 
                        React.createElement(Button, {bsSize: "small", bsStyle: "link", onClick:  this.next}, 
                            React.createElement("i", {className: 'fa fa-fw fa-forward'})
                        ), 
                        React.createElement(Button, {bsSize: "small", bsStyle: "link", className: 'volume-control-holder', onMouseEnter:  this.showVolume, onMouseLeave:  this.hideVolume}, 
                            React.createElement("i", {className: 'fa fa-fw fa-volume-up'}), 
                            React.createElement("div", {className:  this.state.showVolume ? 'volume-control visible' : 'volume-control'}, 
                                React.createElement("input", {type: 'range', min: '0', max: '100', onChange:  this.setVolume})
                            )
                        )
                    )
                ), 
                React.createElement(Col, {sm: 6, className: 'text-center'}, 
                    React.createElement(PlayingBar, {trackPlaying:  this.props.trackPlaying})
                ), 
                React.createElement(Col, {sm: 1, className: 'playlist-controls'}, 
                    React.createElement(Button, {bsSize: "small", bsStyle: "link", className: 'show-playlist', onClick:  this.togglePlaylist}, 
                        React.createElement("i", {className: 'fa fa-fw fa-list'}), 
                        React.createElement(PlayList, {showPlaylist:  this.state.showPlaylist, playlist:  this.props.playlist})
                    )
                ), 
                React.createElement(Col, {sm: 2, className: 'search'}, 
                    React.createElement("input", {type: 'text', className: 'form-control input-sm', placeholder: 'search', onChange:  this.search})
                )
            )
        );
    },

    win: {

       close: function () {
           Window.close()
       },

       minimize: function () {
           Window.minimize()
       },

       maximize: function () {
           if (!Window.maximized) {
               Window.maximize();
               Window.maximized = true;
           } else {
               Window.unmaximize();
               Window.maximized = false;
           }
       }
   },

    search: function (e) {
        Instance.filterSearch(e.currentTarget.value);
    },

    play: function () {
        Instance.player.play();
    },

    pause: function () {
        Instance.player.pause();
    },

    next: function () {
        Instance.player.next();
    },

    previous: function () {
        Instance.player.previous();
    },

    setVolume: function (e) {
        audio.volume = e.currentTarget.value / 100;
    },

    showVolume: function () {
        this.setState({ showVolume: true });
    },

    hideVolume: function () {
        this.setState({ showVolume: false });
    },

    togglePlaylist: function () {
        if (this.state.showPlaylist)
            this.setState({ showPlaylist: false });
        else
            this.setState({ showPlaylist: true });
    }
});



/*
|--------------------------------------------------------------------------
| Header - PlayList
|--------------------------------------------------------------------------
*/

var PlayList = React.createClass({displayName: "PlayList",

    getInitialState: function () {

        return {};
    },

    render: function () {

        var playlist = this.props.playlist;

        if(playlist.length == 0) {
            return playlistContent = (
                React.createElement("div", {className:  this.props.showPlaylist ? 'playlist visible text-left' : 'playlist text-left'}, 
                    React.createElement("div", {className: 'empty-playlist text-center'}, 
                        "queue list is empty"
                    )
                )
            );
        } else {

            playlist = playlist.slice(0, 20); // Get the 20 next tracks displayed

            var hr = React.createElement("hr", null);

            var playlistContent = playlist.map(function (track, index) {

                if(index == playlist.length - 1) hr = React.createElement("div", null);

                return (
                    React.createElement("div", {key: index, className: 'track'}, 
                        React.createElement("div", {className: 'title'}, 
                             track.title
                        ), 
                        React.createElement("div", {className: 'other-infos'}, 
                            React.createElement("span", {className: 'artist'},  track.artist), " - ", React.createElement("span", {className: 'album'},  track.album)
                        ), 
                         hr 
                    )
                );
            });
        }

        return (
            React.createElement("div", {className:  this.props.showPlaylist ? 'playlist visible text-left' : 'playlist text-left'}, 
                React.createElement("div", {className: 'playlist-header'}, 
                    "next tracks"
                ), 
                React.createElement("div", {className: 'playlist-body'}, 
                     playlistContent 
                )
            )
        );
    }
});



/*
|--------------------------------------------------------------------------
| Header - PlayingBar
|--------------------------------------------------------------------------
*/


var PlayingBar = React.createClass({displayName: "PlayingBar",

    getInitialState: function () {

        return {
            elapsed: 0
        };
    },

    render: function () {

        var trackPlaying = this.props.trackPlaying;
        var playingBar;

        if(trackPlaying === null) {

            playingBar = React.createElement("div", null);

        } else {

            var track = Instance.state.tracks[trackPlaying];

            if(this.state.elapsed < track.duration && audio.paused === false) var elapsedPercent = this.state.elapsed * 100 / track.duration;

            playingBar = (
                React.createElement("div", {className: 'now-playing'}, 
                    React.createElement("div", {className: 'track-info'}, 
                        React.createElement("div", {className: 'track-info-metas'}, 
                            React.createElement("span", {className: 'title'}, 
                                 track.title
                            ), 
                            " by ", 
                            React.createElement("span", {className: 'artist'}, 
                                 track.artist.join(', ') 
                            ), 
                            " on ", 
                            React.createElement("span", {className: 'album'}, 
                                 track.album
                            )
                        ), 

                        React.createElement("span", {className: 'duration'}, 
                             parseDuration(parseInt(this.state.elapsed)), " / ",  parseDuration(parseInt(track.duration)) 
                        )
                    ), 
                    React.createElement("div", {className: 'now-playing-bar'}, 
                        React.createElement(ProgressBar, {now: elapsedPercent, onMouseDown:  this.jumpAudioTo})
                    )
                )
            );
        }

        return playingBar;
    },

    componentDidMount: function() {

        if (this.props.nowPlayin !== null) this.timer = setInterval(this.tick, 150);
    },

    componentWillUnmount: function() {

        clearInterval(this.timer);
    },

    tick: function () {

        this.setState({ elapsed: audio.currentTime });
    },

    jumpAudioTo: function(e) {

        var bar = document.querySelector('.now-playing-bar');
        var percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        var jumpTo = (percent * Instance.state.tracks[Instance.state.trackPlaying].duration) / 100;

        audio.currentTime = jumpTo;
    }
});



/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

var Footer = React.createClass({displayName: "Footer",

    render: function () {

        if (this.props.playerStatus == 'play') {
            var playButton = (
                React.createElement(Button, {bsStyle: "default", onClick:  this.pause}, 
                    React.createElement("i", {className: 'fa fa-fw fa-pause'})
                )
            );
        } else if (this.props.playerStatus == 'pause') {
            var playButton = (
                React.createElement(Button, {bsStyle: "default", onClick:  this.play}, 
                    React.createElement("i", {className: 'fa fa-fw fa-play'})
                )
            );
        }


        return (
            React.createElement("footer", {className: 'row'}, 
                React.createElement(Col, {sm: 3}, 
                    React.createElement(ButtonGroup, null, 
                        React.createElement("a", {href: '#/settings', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-gear'})), 
                        React.createElement("a", {href: '#/', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-align-justify'}))
                    )
                ), 
                React.createElement(Col, {sm: 5, className: 'status text-center'}, 
                     this.props.status
                )
            )
        );
    }
});
