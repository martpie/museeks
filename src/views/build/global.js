'use strict';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var Museeks = React.createClass({displayName: "Museeks",

    getInitialState: function () {
        return {
            library      :  null,
            tracks       :  null,
            trackPlaying :  null,
            view         :  views.libraryList,
            playerStatus : 'pause'
        }
    },

    componentWillMount: function () {
        this.refreshLibrary();
    },

    render: function () {

        var status = this.getStatus();

        return (
            React.createElement("div", {className: 'main'}, 
                React.createElement(Header, {trackPlaying:  this.state.trackPlaying}), 
                React.createElement("div", {className: 'main-content'}, 
                    React.createElement("div", {className: 'alerts-container row'}
                    ), 
                    React.createElement("div", {className: 'content row'}, 
                        React.createElement(this.state.view, {library:  this.state.tracks, trackPlaying:  this.state.trackPlaying})
                    )
                ), 
                React.createElement(Footer, {status:  status, playerStatus:  this.state.playerStatus})
            )
        );
    },

    getStatus: function (status) {

        return 'an Apple a day, keeps Dr Dre away';
    },

    refreshLibrary: function() {

        var self = this;

        db.find({}).sort({ lArtist: 1, year: 1, album: 1, disk: 1, track: 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {
                self.setState({
                    library :  tracks,
                });

                self.filterSearch();
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

    play: function(id) {

        var tracks = this.state.tracks;

        audio.src = 'file://' + tracks[id].path;
        audio.play();

        audio.addEventListener('ended', Instance.player.next);

        this.setState({ trackPlaying: id, playerStatus: 'play' });
    },

    player: {

        play: function () {

            Instance.setState({ playerStatus: 'play' });
            audio.play();
        },

        pause: function () {

            Instance.setState({ playerStatus: 'pause' });
            audio.pause();
        },

        next: function (e) {

            if(e !== undefined) e.target.removeEventListener(e.type);

            var newTrackPlaying = Instance.state.trackPlaying + 1;
            var newTrack        = Instance.state.tracks[newTrackPlaying];

            if (newTrack !== undefined) {

                audio.src = newTrack.path;
                audio.play();

                Instance.setState({ trackPlaying: newTrackPlaying });

            } else {

                audio.pause();
                audio.src = '';
                Instance.setState({ trackPlaying: null });
            }
        },

        previous: function () {
            var newTrackPlaying = Instance.state.trackPlaying - 1;
            var newTrack        = Instance.state.tracks[newTrackPlaying];

            if (newTrack !== undefined) {

                audio.src = newTrack.path;
                audio.play();

                Instance.setState({ trackPlaying: newTrackPlaying });

            } else {

                Instance.setState({ trackPlaying: null });
            }
        }
    }
});



/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

var Header = React.createClass({displayName: "Header",

    render: function () {

        return (
            React.createElement("header", {className: 'row'}, 
                React.createElement("div", {className: 'window-controls col-sm-2 text-left'}, 
                    React.createElement("button", {className: 'control control-close', title: 'Close', onClick:  this.win.close}), 
                    React.createElement("button", {className: 'control control-minimize', title: 'Minimize', onClick:  this.win.minimize}), 
                    React.createElement("button", {className: 'control control-maximize', title: 'Maximize', onClick:  this.win.maximize})
                ), 
                React.createElement("div", {className: 'col-sm-6 col-sm-offset-1 text-center'}, 
                    React.createElement(PlayingBar, {trackPlaying:  this.props.trackPlaying})
                ), 
                React.createElement("div", {className: 'col-sm-2 col-sm-offset-1 search'}, 
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
    }
});



var PlayingBar = React.createClass({displayName: "PlayingBar",

    getInitialState: function () {

        return {
            elapsed: 0
        }
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
                    React.createElement("div", {className: 'now-playing-bar'}, 
                        React.createElement("div", {className: 'progress', onMouseDown:  this.jumpAudioTo}, 
                            React.createElement("div", {className: 'progress-bar', style: { width: elapsedPercent + '%'}})
                        )
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
                React.createElement("button", {className: 'btn btn-default', onClick:  this.pause}, 
                    React.createElement("i", {className: 'fa fa-fw fa-pause'})
                )
            );
        } else if (this.props.playerStatus == 'pause') {
            var playButton = (
                React.createElement("button", {className: 'btn btn-default', onClick:  this.play}, 
                    React.createElement("i", {className: 'fa fa-fw fa-play'})
                )
            );
        }


        return (
            React.createElement("footer", {className: 'row'}, 
                React.createElement("div", {className: 'col-sm-3'}, 
                    React.createElement("div", {className: 'btn-group'}, 
                        React.createElement("a", {href: '#/settings', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-gear'})), 
                        React.createElement("a", {href: '#/', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-align-justify'}))
                    )
                ), 
                React.createElement("div", {className: 'status col-sm-5 text-center'}, 
                     this.props.status
                ), 
                React.createElement("div", {className: 'col-sm-4 text-right player-controls'}, 
                    React.createElement("input", {type: 'range', min: '0', max: '100', className: 'volume-control', onChange:  this.setVolume}), 
                    React.createElement("div", {className: 'btn-group'}, 
                        React.createElement("button", {className: 'btn btn-default', onClick:  this.previous}, 
                            React.createElement("i", {className: 'fa fa-fw fa-backward'})
                        ), 
                         playButton, 
                        React.createElement("button", {className: 'btn btn-default', onClick:  this.next}, 
                            React.createElement("i", {className: 'fa fa-fw fa-forward'})
                        ), 
                        React.createElement("button", {className: 'btn btn-default'}, 
                            React.createElement("i", {className: 'fa fa-fw fa-list'})
                        )
                    )
                )
            )
        );
    },

    setVolume: function (e) {

        audio.volume = e.currentTarget.value / 100;
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
    }
});
