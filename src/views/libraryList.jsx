/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

views.libraryList = React.createClass({

    render: function() {

        var content;

        if(this.props.library === null) {
            content = (
                <div className={'full-message'}>
                    <i className={'fa fa-circle-o-notch fa-spin loading'}></i>
                    { 'Loadin\' stuff...' }
                </div>
            );
        }
        else if (this.props.library.length == 0) {
            return(
                <div className={'full-message'}>Too bad, there is no music in your library =(</div>
            );
        }
        else {
            content = (
                <div>
                    <LibraryListItems tracks={ this.props.library } nowPlaying={ this.props.nowPlaying } search={ this.props.search } />
                </div>
            );
        }

        return (
            <div className={'view view-library-list'} >
                { content }
            </div>
        );
    },

});



/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

var LibraryListItems = React.createClass({
    getInitialState: function () {
        return {
            selected: 0
        };
    },
    render: function() {

        var self       = this;
        var selected   = this.state.selected;
        var tracks     = this.props.tracks;
        var nowPlaying = this.props.nowPlaying;
        var playing    = null;

        var search = self.props.search.toLowerCase();

        var list = tracks.map(function(track, index) {

            if(search != '') {

                if(track.lArtist.indexOf(search) === -1
                    && track.album.toLowerCase().indexOf(search) === -1
                    && track.genre.join(', ').toLowerCase().indexOf(search) === -1
                    && track.title.toLowerCase().indexOf(search) === -1) {

                    return null;
                }
            }

            if(track == nowPlaying) var playing = (<i className={'fa fa-volume-up'}></i>);

            return(
                <tr className={ index === selected ? 'track selected' : 'track' } key={index} onMouseDown={ self.selectTrack.bind(self, index) } onDoubleClick={ Instance.play.bind(self, track) }>
                    <td className={'text-center'}>
                        { playing }
                    </td>
                    <td>
                        { track.title }
                    </td>
                    <td>
                        { parseDuration(track.duration) }
                    </td>
                    <td>
                        { track.artist[0] }
                    </td>
                    <td>
                        { track.album }
                    </td>
                    <td>
                        { track.genre.join(', ') }
                    </td>
                </tr>
            );
        });

        return (
            <table className={'table table-striped list tracks-list'}>
                <thead>
                    <tr>
                        <th className={'row-nowplaying'}><div><i className={'fa fa-fw'}></i></div></th>
                        <th className={'row-track'}><div>Track</div></th>
                        <th className={'row-duration'}><div>Duration</div></th>
                        <th className={'row-artist'}><div>Artist</div></th>
                        <th className={'row-album'}><div>Album</div></th>
                        <th className={'row-genre'}><div>Genre</div></th>
                    </tr>
                </thead>
                <tbody>
                    { list }
                </tbody>
            </table>
        );
    },
    selectTrack: function(index) {

        this.setState({selected: index});
    }
});
