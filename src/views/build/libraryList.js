/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

views.libraryList = React.createClass({displayName: "libraryList",

    render: function() {

        var content;

        if(this.props.library === null) {
            content = (
                React.createElement("div", {className: 'full-message'}, 
                    React.createElement("i", {className: 'fa fa-circle-o-notch fa-spin loading'}), 
                     'Loadin\' stuff...' 
                )
            );
        }
        else if (this.props.library.length == 0) {
            return(
                React.createElement("div", {className: 'full-message'}, "Too bad, there is no music in your library =(")
            );
        }
        else {
            content = (
                React.createElement("div", null, 
                    React.createElement(LibraryListItems, {tracks:  this.props.library, nowPlaying:  this.props.nowPlaying, search:  this.props.search})
                )
            );
        }

        return (
            React.createElement("div", {className: 'view view-library-list'}, 
                 content 
            )
        );
    }
});



/*
|--------------------------------------------------------------------------
| Child - ArtistList
|--------------------------------------------------------------------------
*/

var LibraryListItems = React.createClass({displayName: "LibraryListItems",

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

        var list = tracks.map(function(track, index) {

            if(track == nowPlaying) var playing = (React.createElement("i", {className: 'fa fa-volume-up'}));

            return(
                React.createElement("tr", {className:  index === selected ? 'track selected' : 'track', key: index, onMouseDown:  self.selectTrack.bind(null, index), onDoubleClick:  Instance.play.bind(null, track) }, 
                    React.createElement("td", {className: 'text-center'}, 
                         playing 
                    ), 
                    React.createElement("td", null, 
                         track.title
                    ), 
                    React.createElement("td", null, 
                         parseDuration(track.duration) 
                    ), 
                    React.createElement("td", null, 
                         track.artist[0] 
                    ), 
                    React.createElement("td", null, 
                         track.album
                    ), 
                    React.createElement("td", null, 
                         track.genre.join(', ') 
                    )
                )
            );
        });

        return (
            React.createElement("table", {className: 'table table-striped list tracks-list'}, 
                React.createElement("thead", null, 
                    React.createElement("tr", null, 
                        React.createElement("th", {className: 'row-nowplaying'}, React.createElement("div", null, React.createElement("i", {className: 'fa fa-fw'}))), 
                        React.createElement("th", {className: 'row-track'}, React.createElement("div", null, "Track")), 
                        React.createElement("th", {className: 'row-duration'}, React.createElement("div", null, "Duration")), 
                        React.createElement("th", {className: 'row-artist'}, React.createElement("div", null, "Artist")), 
                        React.createElement("th", {className: 'row-album'}, React.createElement("div", null, "Album")), 
                        React.createElement("th", {className: 'row-genre'}, React.createElement("div", null, "Genre"))
                    )
                ), 
                React.createElement("tbody", null, 
                     list 
                )
            )
        );
    },

    selectTrack: function(index) {

        this.setState({selected: index});
    }
});
