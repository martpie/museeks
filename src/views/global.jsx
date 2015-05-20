'use strict';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Museeks = React.createClass({

    getInitialState: function () {
        return {
            library       :  null,
            tracks        :  null,
            trackPlaying  :  null,
            view          :  views.libraryList,
            playerStatus  : 'pause',
            notifications :  {}
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
                <Alert key={ id } bsStyle={ notifications[id].type } className={ 'notification' }>
                    { notifications[id].content }
                </Alert>
            );
        });


        return (
            <div className={'main'}>
                <Header trackPlaying={ this.state.trackPlaying } />
                <div className={'main-content'}>
                    <div className={'alerts-container'}>
                        <ReactCSSTransitionGroup transitionName='notification'>
                            { notificationsBlock }
                        </ReactCSSTransitionGroup>
                    </div>
                    <div className={'content row'}>
                        <this.state.view library={ this.state.tracks } trackPlaying={ this.state.trackPlaying } />
                    </div>
                </div>
                <Footer status={ status } playerStatus={ this.state.playerStatus } />
            </div>
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
        }
    }
});



/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

var Header = React.createClass({

    render: function () {

        return (
            <header className={'row'}>
                <div className={'window-controls col-sm-2 text-left'}>
                </div>
                <div className={'col-sm-6 col-sm-offset-1 text-center'}>
                    <PlayingBar trackPlaying={ this.props.trackPlaying } />
                </div>
                <div className={'col-sm-2 col-sm-offset-1 search'}>
                    <input type={'text'} className={'form-control input-sm'} placeholder={'search'} onChange={ this.search } />
                </div>
            </header>
        );
    },

    search: function (e) {

        Instance.filterSearch(e.currentTarget.value);
    }
});



var PlayingBar = React.createClass({

    getInitialState: function () {

        return {
            elapsed: 0
        }
    },

    render: function () {

        var trackPlaying = this.props.trackPlaying;
        var playingBar;

        if(trackPlaying === null) {

            playingBar = <div></div>;

        } else {

            var track = Instance.state.tracks[trackPlaying];

            if(this.state.elapsed < track.duration && audio.paused === false) var elapsedPercent = this.state.elapsed * 100 / track.duration;

            playingBar = (
                <div className={'now-playing'}>
                    <div className={'track-info'}>
                        <span className={'title'}>
                            { track.title }
                        </span>
                        &nbsp;by&nbsp;
                        <span className={'artist'}>
                            { track.artist.join(', ') }
                        </span>
                        &nbsp;on&nbsp;
                        <span className={'album'}>
                            { track.album }
                        </span>
                        &nbsp;
                        <span className={'duration'}>
                            { parseDuration(parseInt(this.state.elapsed)) } / { parseDuration(parseInt(track.duration)) }
                        </span>
                    </div>
                    <div className={'now-playing-bar'}>
                        <div className={'progress'} onMouseDown={ this.jumpAudioTo }>
                            <div className={'progress-bar'} style={{ width: elapsedPercent + '%' }}></div>
                        </div>
                    </div>
                </div>
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

var Footer = React.createClass({

    render: function () {

        if (this.props.playerStatus == 'play') {
            var playButton = (
                <Button bsStyle='default' onClick={ this.pause }>
                    <i className={'fa fa-fw fa-pause'}></i>
                </Button>
            );
        } else if (this.props.playerStatus == 'pause') {
            var playButton = (
                <Button bsStyle='default' onClick={ this.play }>
                    <i className={'fa fa-fw fa-play'}></i>
                </Button>
            );
        }


        return (
            <footer className={'row'}>
                <div className={'col-sm-3'}>
                    <div className={'btn-group'}>
                        <a href={'#/settings'} className={'btn btn-default'}><i className={'fa fa-gear'}></i></a>
                        <a href={'#/'} className={'btn btn-default'}><i className={'fa fa-align-justify'}></i></a>
                    </div>
                </div>
                <div className={'status col-sm-5 text-center'}>
                    { this.props.status }
                </div>
                <div className={'col-sm-4 text-right player-controls'}>
                    <input type={'range'} min={'0'} max={'100'} className={'volume-control'} onChange={ this.setVolume } />
                    <div className={'btn-group'}>
                        <Button bsStyle='default' onClick={ this.previous }>
                            <i className={'fa fa-fw fa-backward'}></i>
                        </Button>
                        { playButton }
                        <Button bsStyle='default' onClick={ this.next }>
                            <i className={'fa fa-fw fa-forward'}></i>
                        </Button>
                        <Button bsStyle='default' disabled>
                            <i className={'fa fa-fw fa-list'}></i>
                        </Button>
                    </div>
                </div>
            </footer>
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
