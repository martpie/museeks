'use strict';

/*
|--------------------------------------------------------------------------
| The App
|--------------------------------------------------------------------------
*/

var Museeks = React.createClass({

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
            <div className={'main'}>
                <Header nowPlaying={ this.state.nowPlaying } />
                <div className={'main-content'}>
                    <div className={'alerts-container row'}>
                    </div>
                    <div className={'content row'}>
                        <this.state.view library={ this.state.library } search={ this.state.search } />
                    </div>
                </div>
                <Footer status={ status } />
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

var Header = React.createClass({

    render: function () {

        return (
            <header className="row">
                <div className={'window-controls col-sm-2 text-left'}>
                    <button className={'control control-close'} title={'Close'} onClick={ this.win.close }></button>
                    <button className={'control control-minimize'} title={'Minimize'} onClick={ this.win.minimize }></button>
                    <button className={'control control-maximize'} title={'Maximize'} onClick={ this.win.maximize }></button>
                </div>
                <div className={'col-sm-6 col-sm-offset-1 text-center'}>
                    <PlayingBar nowPlaying={ this.props.nowPlaying } />
                </div>
                <div className={'col-sm-2 col-sm-offset-1 search'}>
                    <input type={'text'} className={'form-control input-sm'} placeholder={'search'} onChange={ this.search } />
                </div>

            </header>
        );
    },

    win: {
        // REFACTOR THIS FOR ATOM SHELL
        close: function () {
            win.close()
        },
        minimize: function () {
            win.minimize()
        },
        maximize: function () {
            if (!win.maximized) {
                win.maximize();
                win.maximized = true;
            } else {
                win.unmaximize();
                win.maximized = false;
            }
        }
    },

    search: function (e) {

        Instance.setState({ search : e.currentTarget.value });
    }
});



var PlayingBar = React.createClass({

    getInitialState: function () {

        return {
            elapsed: 0
        }
    },

    render: function () {

        var nowPlaying = this.props.nowPlaying;
        var playingBar;

        if(nowPlaying === null) {

            playingBar = <div></div>;

        } else {

            if(this.state.elapsed < nowPlaying.duration && audio.paused === false) var elapsed = this.state.elapsed * 100 / nowPlaying.duration;


            playingBar = (
                <div className={'now-playing'}>
                    <div className={'track-info'}>
                        <span className={'title'}>
                            { nowPlaying.title }
                        </span>
                        &nbsp;by&nbsp;
                        <span className={'artist'}>
                            { nowPlaying.artist.join(', ') }
                        </span>
                        &nbsp;on&nbsp;
                        <span className={'album'}>
                            { nowPlaying.album }
                        </span>
                    </div>
                    <div className={'now-playing-bar'} onMouseDown={ this.jumpAudioTo }>
                        <div className="progress">
                            <div className="progress-bar" style={{ width: elapsed + '%' }}></div>
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

        var jumpTo = (percent * Instance.state.nowPlaying.duration) / 100;

        audio.currentTime = jumpTo
    }
});



/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

var Footer = React.createClass({

    render: function () {

        return (
            <footer className={'row'}>
                <div className={'col-sm-3'}>
                    <div className={'btn-group'}>
                        <a href={'#/settings'} className={'btn btn-default'}><i className={'fa fa-gear'}></i></a>
                        <a href={'#/'} className={'btn btn-default'}><i className={'fa fa-align-justify'}></i></a>
                        <a href={'#/library-columns'} className={'btn btn-default'}><i className={'fa fa-columns'}></i></a>
                    </div>
                </div>
                <div className="status col-sm-5 text-center">
                    { this.props.status }
                </div>
                <div className="col-sm-4 text-right player-controls">
                    <input type="range" name="range" min="0" max="100" className={'volume-control'} />
                    <div className={'btn-group'}>
                        <button className={'btn btn-default'}>
                            <i className={'fa fa-fw fa-backward'}></i>
                        </button>
                        <button className={'btn btn-default'}>
                            <i className={'fa fa-fw fa-play'}></i>
                        </button>
                        <button className={'btn btn-default'}>
                            <i className={'fa fa-fw fa-forward'}></i>
                        </button>
                        <button className={'btn btn-default'}>
                            <i className={'fa fa-fw fa-list'}></i>
                        </button>
                    </div>
                </div>
            </footer>
        );
    }
});
