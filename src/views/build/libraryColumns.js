/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

views.libraryColumns = React.createClass({displayName: "libraryColumns",
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
                React.createElement("div", {className: 'full-message'}, 
                    React.createElement("i", {className: 'fa fa-circle-o-notch fa-spin'}), 
                    "Loadin bitches !"
                )
            );
        } else if (tracks.length === 0) {
            content = (
                React.createElement("div", {className: 'full-message'}, 
                    "Too bad, there is no music in your library =("
                ));
        }
        else {
            content = (
                React.createElement("div", {className: 'columns'}, 
                    React.createElement(ArtistsList, {artists:  this.state.artists}), 
                    React.createElement(AlbumsList, null), 
                    React.createElement(TracksList, null)
                )
            );
        }



        return (
            React.createElement("div", {className: 'view view-library-columns'}, 
                 content 
            )
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

var ArtistsList = React.createClass({displayName: "ArtistsList",
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
                React.createElement("li", {className: index == selectedArtist ? 'artist selected' : 'artist', key: index, onClick: self.selectArtist.bind(self, index)}, 
                     track.artist.join(' & ') 
                )
            );
        });

        return (
            React.createElement("ul", {className: 'list artists-list'}, 
                 list 
            )
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

var AlbumsList = React.createClass({displayName: "AlbumsList",
    render: function () {
        return (
            React.createElement("ul", {className: 'list albums-list'}, 
                React.createElement("li", null, "Albums list")
            )
        );
    }
});



/*
|--------------------------------------------------------------------------
| Child - TrackList
|--------------------------------------------------------------------------
*/

var TracksList = React.createClass({displayName: "TracksList",
    render: function () {
        return (
            React.createElement("ul", {className: 'list tracks-list'}, 
                React.createElement("li", null, "Tracks list")
            )
        );
    }
});
