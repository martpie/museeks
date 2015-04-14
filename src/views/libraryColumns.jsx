/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

views.libraryColumns = React.createClass({
    getInitialState: function () {
            return {
                tracks: 'loading',
                artists: null,
            };
    },
    componentWillMount: function () {
        this.getLibrary();
    },
    render: function() {

        var content;
        var tracks = this.state.tracks;

        if(tracks == 'loading') {
            content = (
                <div className={'full-message'}>
                    <i className={'fa fa-circle-o-notch fa-spin'}></i>
                    Loadin bitches !
                </div>
            );
        } else if (tracks.length === 0) {
            content = (
                <div className={'full-message'}>
                    Too bad, there is no music in your library =(
                </div>);
        }
        else {
            content = (
                <div className={'columns'}>
                    <ArtistsList artists={ this.state.artists } />
                    <AlbumsList />
                    <TracksList />
                </div>
            );
        }



        return (
            <div className={'view view-library-columns'} >
                { content }
            </div>
        );
    },
    getLibrary: function() {
        var self = this;

        db.find({}).sort({ lArtist: 1 }).exec(function (err, tracks) {
            if (err) throw err;
            else {

                var distinctArtists = tracks;

                distinctArtists.forEach(function(track, index) {
                    if (distinctArtists[index - 1] !== undefined) {
                        if(distinctArtists[index - 1].artist[0] == distinctArtists[index].artist[0]) {
                            delete distinctArtists[index - 1];
                        }
                    }
                });

                self.setState({
                    tracks  : tracks,
                    artists : distinctArtists
                });
            }
        });
    }
});



/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

var ArtistsList = React.createClass({
    getInitialState: function () {
        return {
            selectedArtist: 0
        };
    },
    render: function() {

        var self = this;
        var selectedArtist = this.state.selectedArtist;

        var list = this.props.artists.map(function(track, index) {
            return(
                <li className={index == selectedArtist ? 'artist selected' : 'artist'} key={index} onClick={self.selectArtist.bind(self, index)}>
                    { track.artist.join(' & ') }
                </li>
            );
        });

        return (
            <ul className={'list artists-list'}>
                { list }
            </ul>
        );
    },
    selectArtist: function(index){
        this.setState({selectedArtist: index});
    }
});



/*
|--------------------------------------------------------------------------
| Child - AlbumList
|--------------------------------------------------------------------------
*/

var AlbumsList = React.createClass({
    render: function () {
        return (
            <ul className={'list albums-list'}>
                <li>Albums list</li>
            </ul>
        );
    }
});



/*
|--------------------------------------------------------------------------
| Child - TrackList
|--------------------------------------------------------------------------
*/

var TracksList = React.createClass({
    render: function () {
        return (
            <ul className={'list tracks-list'}>
                <li>Tracks list</li>
            </ul>
        );
    }
});
