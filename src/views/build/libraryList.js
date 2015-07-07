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
                    React.createElement("p", null,  "Loadin\' stuff..." )
                )
            );
        }
        else if (this.props.library.length == 0) {
            content = (
                React.createElement("div", {className: 'full-message'}, 
                    React.createElement("p", null, "Too bad, there is no music in your library =("), 
                    React.createElement("p", {className: "sub-message"}, "you may need to refresh your library or add folders into it.")
                )
            );
        }
        else if (this.props.tracks.length == 0) {
            content = (
                React.createElement("div", {className: 'full-message'}, 
                    React.createElement("p", null, "Your search returned no results, sorry :/")
                )
            );
        }
        else {
            content = (
                React.createElement("div", null, 
                    React.createElement(LibraryListItems, {tracks:  this.props.tracks, trackPlaying:  this.props.trackPlaying})
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

        var self         = this;
        var selected     = this.state.selected;
        var tracks       = this.props.tracks;
        var trackPlaying = this.props.trackPlaying;
        var playing      = null;

        var list = tracks.map(function(track, index) {

            if(index == trackPlaying) var playing = (React.createElement("i", {className: 'fa fa-fw fa-volume-up'}));
            if(index == trackPlaying && audio.paused) var playing = (React.createElement("i", {className: 'fa fa-fw fa-volume-off'}));

            return(
                React.createElement("tr", {className:  index === selected ? 'track selected' : 'track', key: index, onMouseDown:  self.selectTrack.bind(null, index), onDoubleClick:  Instance.selectAndPlay.bind(null, index) }, 
                    React.createElement("td", {className: 'row-trackPlaying text-center'}, 
                         playing 
                    ), 
                    React.createElement("td", {className: 'row-track'}, 
                         track.title
                    ), 
                    React.createElement("td", {className: 'row-duration'}, 
                         parseDuration(track.duration) 
                    ), 
                    React.createElement("td", {className: 'row-artist'}, 
                         track.artist[0] 
                    ), 
                    React.createElement("td", {className: 'row-album'}, 
                         track.album
                    ), 
                    React.createElement("td", {className: 'row-genre'}, 
                         track.genre.join(', ') 
                    )
                )
            );
        });

        return (
            React.createElement("div", {className: 'tracks-list-container'}, 
                React.createElement("table", {className: 'table table-striped tracks-list'}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", null, 
                            React.createElement("th", {className: 'row-trackPlaying'}, React.createElement("div", null, React.createElement("i", {className: 'fa fa-fw'}))), 
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
            )
        );
    },

    selectTrack: function(index) {

        this.setState({selected: index});
    }
});
