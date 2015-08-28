'use strict';



/*
|--------------------------------------------------------------------------
| Some Variables
|--------------------------------------------------------------------------
*/

// nothing here anymore for the moment



/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var Museeks = React.createClass({

    getInitialState: function () {

        var defaultView = views.libraryList;

        return {
            library           :  null, // All tracks
            tracks            :  null, // All tracks shown on the view
            playlist          :  [],   // Tracks to be played
            playlistCursor    :  null, // The cursor of the playlist
            view              :  defaultView, // The actual view
            playerStatus      : 'stop', // Player status
            notifications     :  {},     // The array of notifications
            refreshingLibrary :  false   // If the app is currently refreshing the app
        };
    },

    componentWillMount: function () {

        // Register global shorcuts
        var shortcuts = {};

        shortcuts.play = globalShortcut.register('MediaPlayPause', function () {
            Instance.player.playToggle();
        });

        shortcuts.previous = globalShortcut.register('MediaPreviousTrack', function () {
            Instance.player.previous();
        });

        shortcuts.previous = globalShortcut.register('MediaNextTrack', function () {
            Instance.player.next();
        });

        // Refresh the library
        this.refreshLibrary();
    },

    mixins: [ReactKeybinding],

    keybindingsPlatformAgnostic: true,

    keybindings: {
        'space' : 'space'
    },

    keybinding: function(e, action) {

        e.preventDefault();

        switch(action) {
            case 'space':
                Instance.player.playToggle();
                break;
        }
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

        var trackPlayingID = (this.state.playlist.length > 0 && this.state.playlistCursor !== null) ? this.state.playlist[this.state.playlistCursor]._id : null;

        return (
            <div className={'main'}>
                <Header playerStatus={ this.state.playerStatus } playlist={ this.state.playlist } playlistCursor={ this.state.playlistCursor } />
                <div className={'main-content'}>
                    <div className={'alerts-container'}>
                        <div>
                            { notificationsBlock }
                        </div>
                    </div>
                    <Row className={'content'}>
                        <this.state.view
                            tracks={ this.state.tracks }
                            library={ this.state.library }
                            trackPlayingID={ trackPlayingID }
                            refreshingLibrary={ this.state.refreshingLibrary }
                        />
                    </Row>
                </div>
                <Footer status={ status } refreshingLibrary={ this.state.refreshingLibrary } />
            </div>
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

        playToggle: function () {
            if(audio.paused && Instance.state.playlist !== null) {
                Instance.player.play();
            } else {
                Instance.player.pause();
            }
        },

        play: function () {

            if(Instance.state.playlist !== null) {
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

var Header = React.createClass({

    getInitialState: function () {
        return {
            showVolume   : false,
            showPlaylist : false
        }
    },

    render: function () {

        if (this.props.playerStatus == 'play') {
            var playButton = (
                <Button bsSize="small" bsStyle='link' className={'play'} onClick={ this.pause }>
                    <i className={'fa fa-fw fa-pause'}></i>
                </Button>
            );
        } else if (this.props.playerStatus == 'pause') {
            var playButton = (
                <Button bsSize="small" bsStyle='link' className={'play'} onClick={ this.play }>
                    <i className={'fa fa-fw fa-play'}></i>
                </Button>
            );
        } else {
            var playButton = (
                <Button bsSize="small" bsStyle='link' className={'play'}>
                    <i className={'fa fa-fw fa-play'}></i>
                </Button>
            );
        }

        return (
            <header className={'row'}>
                <Col sm={3} className={'player-controls text-center'}>
                    <ButtonGroup className={'win-controls'}>
                        <Button bsSize='small' bsStyle='link' className={'win-close'} onClick={ this.win.close }>&times;</Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button bsSize='small' bsStyle='link' onClick={ this.previous }>
                            <i className={'fa fa-fw fa-backward'}></i>
                        </Button>
                        { playButton }
                        <Button bsSize="small" bsStyle='link' onClick={ this.next }>
                            <i className={'fa fa-fw fa-forward'}></i>
                        </Button>
                        <Button bsSize='small' bsStyle='link' className={'volume-control-holder'} onMouseEnter={ this.showVolume } onMouseLeave={ this.hideVolume }>
                            <i className={'fa fa-fw fa-volume-up'}></i>
                            <div className={ this.state.showVolume ? 'volume-control visible' : 'volume-control' }>
                                <input type={'range'} min={'0'} max={'100'} onChange={ this.setVolume } />
                            </div>
                        </Button>
                    </ButtonGroup>
                </Col>
                <Col sm={6} className={'text-center'}>
                    <PlayingBar
                        playlist={ this.props.playlist }
                        playlistCursor={ this.props.playlistCursor }
                    />
                </Col>
                <Col sm={1} className={'playlist-controls'}>
                    <Button bsSize='small' bsStyle='link' className={'show-playlist'} onClick={ this.togglePlaylist }>
                        <i className={'fa fa-fw fa-list'}></i>
                    </Button>
                    <PlayList
                        showPlaylist={ this.state.showPlaylist }
                        playlist={ this.props.playlist }
                        playlistCursor={ this.props.playlistCursor }
                    />
                </Col>
                <Col sm={2} className={'search'}>
                    <input type={'text'} className={'form-control input-sm'} placeholder={'search'} onClick={ this.searchSelect } onChange={ this.search } />
                </Col>
            </header>
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

    searchSelect: function (e) {
        e.currentTarget.select();
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

var PlayList = React.createClass({

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
                <div className={ this.props.showPlaylist ? 'playlist visible text-left' : 'playlist text-left' }>
                    <div className={'empty-playlist text-center'}>
                        queue is empty
                    </div>
                </div>
            );
        } else {

            var playlistContent = queue.map(function (track, index) {

                return (
                    <div key={index} className={'track'} onDoubleClick={ Instance.selectAndPlay.bind(null, self.props.playlistCursor + index + 1) }>
                        <Button bsSize={'xsmall'} bsStyle={'link'} className={'remove'} onClick={ self.removeFromPlaylist.bind(null, index) }>
                            &times;
                        </Button>
                        <div className={'title'}>
                            { track.title }
                        </div>
                        <div className={'other-infos'}>
                            <span className={'artist'}>{ track.artist }</span> - <span className={'album'}>{ track.album }</span>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div className={ this.props.showPlaylist ? 'playlist visible text-left' : 'playlist text-left' }>
                <div className={'playlist-header'}>
                    <Button bsSize='xsmall' bsStyle='default' className={'empty-button'} onClick={ this.clearPlaylist }>clear queue</Button>
                </div>
                <div className={'playlist-body'}>
                    { playlistContent }
                </div>
            </div>
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


var PlayingBar = React.createClass({

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

            playingBar = <div></div>;

        } else {

            if(this.state.elapsed < trackPlaying.duration && audio.paused === false) var elapsedPercent = this.state.elapsed * 100 / trackPlaying.duration;

            playingBar = (
                <div className={'now-playing'}>
                    <div className={'track-info'}>
                        <div className={'track-info-metas'}>
                            <span className={'title'}>
                                { trackPlaying.title }
                            </span>
                            &nbsp;by&nbsp;
                            <span className={'artist'}>
                                { trackPlaying.artist.join(', ') }
                            </span>
                            &nbsp;on&nbsp;
                            <span className={'album'}>
                                { trackPlaying.album }
                            </span>
                        </div>

                        <span className={'duration'}>
                            { parseDuration(parseInt(this.state.elapsed)) } / { parseDuration(parseInt(trackPlaying.duration)) }
                        </span>
                    </div>
                    <div className={'now-playing-bar'}>
                        <ProgressBar now={ elapsedPercent } onMouseDown={ this.jumpAudioTo } />
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

        if (!this.props.refreshingLibrary) {
            var navButtons = (
                <ButtonGroup>
                    <a href={'#/settings'} className={'btn btn-default'}><i className={'fa fa-gear'}></i></a>
                    <a href={'#/'} className={'btn btn-default'}><i className={'fa fa-align-justify'}></i></a>
                </ButtonGroup>
            );
        } else {
            var navButtons = (
                <ButtonGroup>
                    <a href={'#/settings'} disabled className={'btn btn-default'}><i className={'fa fa-gear'}></i></a>
                    <a href={'#/'} disabled className={'btn btn-default'}><i className={'fa fa-align-justify'}></i></a>
                </ButtonGroup>
            );
        }

        return (
            <footer className={'row'}>
                <Col sm={3}>
                    { navButtons }
                </Col>
                <Col sm={5} className={'status text-center'}>
                    { this.props.status }
                </Col>
            </footer>
        );
    }
});
