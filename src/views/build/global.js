'use strict';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var Museeks = React.createClass({displayName: "Museeks",

    getInitialState: function () {
        return {
            library: null,
            view: views.libraryList,
            search: '',
            nowPlaying: null
        }
    },

    componentWillMount: function () {
        this.refreshLibrary();
    },

    render: function () {

        var status = this.getStatus();

        return (
            React.createElement("div", {className: 'main'}, 
                React.createElement(Header, {nowPlaying:  this.state.nowPlaying}), 
                React.createElement("div", {className: 'main-content'}, 
                    React.createElement("div", {className: 'alerts-container row'}
                    ), 
                    React.createElement("div", {className: 'content row'}, 
                        React.createElement(this.state.view, {library:  this.state.library, search:  this.state.search})
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

        db.find({}).sort({ lArtist: 1, year: 1, album: 1, disk: 1, track: 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {
                self.setState({
                    library : tracks,
                });
            }
        });
    },
    play: function(track) {

        audio.src = 'file://' + track.path;
        audio.play();

        this.setState({ nowPlaying: track });
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
            React.createElement("header", {className: "row"}, 
                React.createElement("div", {className: 'window-controls col-sm-2 text-left'}, 
                    React.createElement("button", {className: 'control control-close', title: 'Close', onClick:  this.win.close}), 
                    React.createElement("button", {className: 'control control-minimize', title: 'Minimize', onClick:  this.win.minimize}), 
                    React.createElement("button", {className: 'control control-maximize', title: 'Maximize', onClick:  this.win.maximize})
                ), 
                React.createElement("div", {className: 'col-sm-6 col-sm-offset-1 text-center'}, 
                    React.createElement(PlayingBar, {nowPlaying:  this.props.nowPlaying})
                ), 
                React.createElement("div", {className: 'col-sm-2 col-sm-offset-1 search'}, 
                    React.createElement("input", {type: 'text', className: 'form-control input-sm', placeholder: 'search', onChange:  this.search})
                )

            )
        );
    },

    win: {
        // REFACTOR THIS FOR ATOM SHELL
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

        Instance.setState({ search : e.currentTarget.value });
    }
});



var PlayingBar = React.createClass({displayName: "PlayingBar",

    getInitialState: function () {

        return {
            elapsed: 0
        }
    },

    render: function () {

        var nowPlaying = this.props.nowPlaying;
        var playingBar;

        if(nowPlaying === null) {

            playingBar = React.createElement("div", null);

        } else {

            if(this.state.elapsed < nowPlaying.duration && audio.paused === false) var elapsed = this.state.elapsed * 100 / nowPlaying.duration;


            playingBar = (
                React.createElement("div", {className: 'now-playing'}, 
                    React.createElement("div", {className: 'track-info'}, 
                        React.createElement("span", {className: 'title'}, 
                             nowPlaying.title
                        ), 
                        " by ", 
                        React.createElement("span", {className: 'artist'}, 
                             nowPlaying.artist.join(', ') 
                        ), 
                        " on ", 
                        React.createElement("span", {className: 'album'}, 
                             nowPlaying.album
                        )
                    ), 
                    React.createElement("div", {className: 'now-playing-bar', onMouseDown:  this.jumpAudioTo}, 
                        React.createElement("div", {className: "progress"}, 
                            React.createElement("div", {className: "progress-bar", style: { width: elapsed + '%'}})
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

        var jumpTo = (percent * Instance.state.nowPlaying.duration) / 100;

        audio.currentTime = jumpTo
    }
});



/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

var Footer = React.createClass({displayName: "Footer",

    render: function () {

        return (
            React.createElement("footer", {className: 'row'}, 
                React.createElement("div", {className: 'col-sm-3'}, 
                    React.createElement("div", {className: 'btn-group'}, 
                        React.createElement("a", {href: '#/settings', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-gear'})), 
                        React.createElement("a", {href: '#/', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-align-justify'})), 
                        React.createElement("a", {href: '#/library-columns', className: 'btn btn-default'}, React.createElement("i", {className: 'fa fa-columns'}))
                    )
                ), 
                React.createElement("div", {className: "status col-sm-5 text-center"}, 
                     this.props.status
                ), 
                React.createElement("div", {className: "col-sm-4 text-right player-controls"}, 
                    React.createElement("input", {type: "range", name: "range", min: "0", max: "100", className: 'volume-control'}), 
                    React.createElement("div", {className: 'btn-group'}, 
                        React.createElement("button", {className: 'btn btn-default'}, 
                            React.createElement("i", {className: 'fa fa-fw fa-backward'})
                        ), 
                        React.createElement("button", {className: 'btn btn-default'}, 
                            React.createElement("i", {className: 'fa fa-fw fa-play'})
                        ), 
                        React.createElement("button", {className: 'btn btn-default'}, 
                            React.createElement("i", {className: 'fa fa-fw fa-forward'})
                        ), 
                        React.createElement("button", {className: 'btn btn-default'}, 
                            React.createElement("i", {className: 'fa fa-fw fa-list'})
                        )
                    )
                )
            )
        );
    }
});
