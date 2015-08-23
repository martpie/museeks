'use strict';



/*
|--------------------------------------------------------------------------
| Some Varibles
|--------------------------------------------------------------------------
*/

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;



/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var Museeks = React.createClass({displayName: "Museeks",

    getInitialState: function () {

        var defaultView = views.libraryList;

        return {
            library           :  null, // All tracks
            tracks            :  null, // All tracks shown on the view
            playlist          :  [],   // Tracks to be played
            playlistCursor    :  null, // The cursor of the playlist
            view              :  defaultView, // The actual view
            playerStatus      : 'pause', // Player status
            notifications     :  {},     // The array of notifications
            refreshingLibrary :  false   // If the app is currently refreshing the app
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

        var trackPlayingID = (this.state.playlist.length > 0 && this.state.playlistCursor !== null) ? this.state.playlist[this.state.playlistCursor]._id : null;

        return (
            React.createElement("div", {className: 'main'}, 
                React.createElement(Header, {playerStatus:  this.state.playerStatus, playlist:  this.state.playlist, playlistCursor:  this.state.playlistCursor}), 
                React.createElement("div", {className: 'main-content'}, 
                    React.createElement("div", {className: 'alerts-container'}, 
                        React.createElement("div", null, 
                             notificationsBlock 
                        )
                    ), 
                    React.createElement(Row, {className: 'content'}, 
                        React.createElement(this.state.view, {
                            tracks:  this.state.tracks, 
                            library:  this.state.library, 
                            trackPlayingID:  trackPlayingID, 
                            refreshingLibrary:  this.state.refreshingLibrary}
                        )
                    )
                ), 
                React.createElement(Footer, {status:  status, refreshingLibrary:  this.state.refreshingLibrary})
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

        var playlist = this.state.tracks;
        var playlistCursor = id;

        audio.src = 'file://' + playlist[id].path;
        audio.play();

        audio.addEventListener('ended', Instance.player.next);

        this.setState({
            playerStatus   : 'play',
            playlist       :  playlist,
            playlistCursor :  id
        });
    },

    player: {

        play: function () {

            if(Instance.state.playlist == null) {

                // nothing here

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

            var playlist           = Instance.state.playlist;
            var newPlaylistCursor  = Instance.state.playlistCursor + 1;

            if (playlist[newPlaylistCursor] !== undefined) {

                audio.src = playlist[newPlaylistCursor].path;
                audio.play();

                Instance.setState({
                    playlistCursor : newPlaylistCursor
                });

            } else {

                audio.pause();
                audio.src = '';
                Instance.setState({
                    playlist       : [],
                    playlistCursor : null});
            }
        },

        previous: function () { // TOFIX

            if (audio.currentTime < 5) {

                var newPlaylistCursor = Instance.state.playlistCursor - 1;

            } else {

                var newPlaylistCursor = Instance.state.playlistCursor
            }

            var newTrack = Instance.state.playlist[newPlaylistCursor];

            if (newTrack !== undefined) {

                audio.src = newTrack.path;
                audio.play();

                Instance.setState({ playlistCursor : newPlaylistCursor });

            } else {

                Instance.setState({ playlist : null });
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
                    React.createElement(PlayingBar, {
                        playlist:  this.props.playlist, 
                        playlistCursor:  this.props.playlistCursor}
                    )
                ), 
                React.createElement(Col, {sm: 1, className: 'playlist-controls'}, 
                    React.createElement(Button, {bsSize: "small", bsStyle: "link", className: 'show-playlist', onClick:  this.togglePlaylist}, 
                        React.createElement("i", {className: 'fa fa-fw fa-list'})
                    ), 
                    React.createElement(PlayList, {
                        showPlaylist:  this.state.showPlaylist, 
                        playlist:  this.props.playlist, 
                        playlistCursor:  this.props.playlistCursor}
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

        return {
            dragOverY : null
        };
    },

    render: function () {

        var self           = this;
        var playlist       = this.props.playlist;
        var playlistCursor = this.props.playlistCursor;

        var queue = playlist.slice(playlistCursor + 1, playlistCursor + 21); // Get the 20 next tracks displayed

        if(queue.length == 0) {
            return playlistContent = (
                React.createElement("div", {className:  this.props.showPlaylist ? 'playlist visible text-left' : 'playlist text-left'}, 
                    React.createElement("div", {className: 'empty-playlist text-center'}, 
                        "queue is empty"
                    )
                )
            );
        } else {

            var playlistContent = queue.map(function (track, index) {

                return (
                    React.createElement("div", {key: index, className: 'track', onDoubleClick:  Instance.selectAndPlay.bind(null, self.props.playlistCursor + index + 1) }, 
                        React.createElement(Button, {bsSize: 'xsmall', bsStyle: 'link', className: 'remove', onClick:  self.removeFromPlaylist.bind(null, index) }, 
                            "×"
                        ), 
                        React.createElement("div", {className: 'title'}, 
                             track.title
                        ), 
                        React.createElement("div", {className: 'other-infos'}, 
                            React.createElement("span", {className: 'artist'},  track.artist), " - ", React.createElement("span", {className: 'album'},  track.album)
                        )
                    )
                );
            });
        }

        return (
            React.createElement("div", {className:  this.props.showPlaylist ? 'playlist visible text-left' : 'playlist text-left'}, 
                React.createElement("div", {className: 'playlist-header'}, 
                    React.createElement(Button, {bsSize: "xsmall", bsStyle: "default", className: 'empty-button', onClick:  this.clearPlaylist}, "clear queue")
                ), 
                React.createElement("div", {className: 'playlist-body'}, 
                     playlistContent 
                )
            )
        );
    },

    clearPlaylist: function () {

        Instance.setState({
            playlist : React.addons.update(
                this.props.playlist,
                {$splice: [
                    [this.props.playlistCursor + 1, this.props.playlist.length - this.props.playlistCursor]]
                }
            )
        });
    },

    removeFromPlaylist: function (index) {

        Instance.setState({
            playlist : React.addons.update(
                this.props.playlist,
                {$splice: [
                    [this.props.playlistCursor + index + 1, 1]]
                }
            )
        });
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

        var playlist       = this.props.playlist;
        var playlistCursor = this.props.playlistCursor;
        var trackPlaying   = playlist[playlistCursor];
        var playingBar;

        if(playlistCursor === null) {

            playingBar = React.createElement("div", null);

        } else {

            if(this.state.elapsed < trackPlaying.duration && audio.paused === false) var elapsedPercent = this.state.elapsed * 100 / trackPlaying.duration;

            playingBar = (
                React.createElement("div", {className: 'now-playing'}, 
                    React.createElement("div", {className: 'track-info'}, 
                        React.createElement("div", {className: 'track-info-metas'}, 
                            React.createElement("span", {className: 'title'}, 
                                 trackPlaying.title
                            ), 
                            " by ", 
                            React.createElement("span", {className: 'artist'}, 
                                 trackPlaying.artist.join(', ') 
                            ), 
                            " on ", 
                            React.createElement("span", {className: 'album'}, 
                                 trackPlaying.album
                            )
                        ), 

                        React.createElement("span", {className: 'duration'}, 
                             parseDuration(parseInt(this.state.elapsed)), " / ",  parseDuration(parseInt(trackPlaying.duration)) 
                        )
                    ), 
                    React.createElement("div", {className: 'now-playing-bar'}, 
                        React.createElement(ProgressBar, {now:  elapsedPercent, onMouseDown:  this.jumpAudioTo})
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

        var playlist       = this.props.playlist;
        var playlistCursor = this.props.playlistCursor;
        var trackPlaying   = playlist[playlistCursor];

        var bar = document.querySelector('.now-playing-bar');
        var percent = ((e.pageX - (bar.offsetLeft + bar.offsetParent.offsetLeft)) / bar.offsetWidth) * 100;

        var jumpTo = (percent * trackPlaying.duration) / 100;

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

        if (!this.props.refreshingLibrary) {
            var navButtons = (
                React.createElement(ButtonGroup, null, 
                    React.createElement("a", {href: '#/settings', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-gear'})), 
                    React.createElement("a", {href: '#/', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-align-justify'}))
                )
            );
        } else {
            var navButtons = (
                React.createElement(ButtonGroup, null, 
                    React.createElement("a", {href: '#/settings', disabled: true, className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-gear'})), 
                    React.createElement("a", {href: '#/', disabled: true, className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-align-justify'}))
                )
            );
        }

        return (
            React.createElement("footer", {className: 'row'}, 
                React.createElement(Col, {sm: 3}, 
                     navButtons 
                ), 
                React.createElement(Col, {sm: 5, className: 'status text-center'}, 
                     this.props.status
                )
            )
        );
    }
});
