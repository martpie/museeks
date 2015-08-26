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
                    React.createElement(LibraryListItems, {
                        tracks:  this.props.tracks, 
                        trackPlayingID:  this.props.trackPlayingID}
                    )
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
            selected: []
        };
    },

    render: function() {

        var self           = this;
        var selected       = this.state.selected;
        var tracks         = this.props.tracks;
        var trackPlayingID = this.props.trackPlayingID;
        var playing        = null;

        var list = tracks.map(function(track, index) {

            if(trackPlayingID != null) {
                if(track._id == trackPlayingID) var playing = (React.createElement("i", {className: 'fa fa-fw fa-volume-up'}));
                if(track._id == trackPlayingID && audio.paused) var playing = (React.createElement("i", {className: 'fa fa-fw fa-volume-off'}));
            }

            return(
                React.createElement("tr", {className:  selected.indexOf(index) != -1 ? 'track selected' : 'track', key: index, onMouseDown:  self.selectTrack.bind(null, index), onDoubleClick:  Instance.selectAndPlay.bind(null, index, event), onContextMenu:  self.showContextMenu}, 
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

    selectTrack: function(index, e) {

        var self = this;

        if(e.button == 0 || (e.button == 2 && this.state.selected.indexOf(index) == -1 )) {
            if(e.ctrlKey) { // add a track in selected tracks
                var selected = this.state.selected;
                selected.push(index);
                this.setState({ selected : selected });
            }
            else if (e.shiftKey) { // add multiple tracks in selected tracks
                var selected = this.state.selected;

                switch(selected.length) {
                    case 0:
                        selected.push(index);
                        this.setState({ selected : selected });
                        break;
                    case 1:
                        var onlySelected = selected[0];
                        for(var i = 1; i <= Math.abs(index - onlySelected); i++) {
                            if(index < onlySelected) {
                                selected.push(onlySelected - i);
                            } else if(index > onlySelected) {
                                selected.push(onlySelected + i);
                            }
                        }
                        self.setState({ selected : selected });
                        break;
                    default:
                        var base;
                        var min = Math.min.apply(Math, selected);
                        var max = Math.max.apply(Math, selected);

                        if(index < min) {
                            base = max;
                        } else if (index > max) {
                            base = min;
                        } else {
                            base = min;
                        }
                        var newSelected = [];
                        for(var i = 0; i <= Math.abs(index - base); i++) {
                            if(index < min) {
                                newSelected.push(base - i);
                            } else if (index > max) {
                                newSelected.push(base + i);
                            }
                        }
                        self.setState({ selected : newSelected });
                        break;
                }
            }
            else { // simple select
                var selected = [];
                selected.push(index);
                this.setState({ selected : selected });
            }
        }
    },

    showContextMenu: function(e) {

        var context = new Menu();
        var selectedLength = this.state.selected.length;

        context.append(new MenuItem({ label: selectedLength > 1 ? selectedLength + ' tracks selected' : selectedLength + ' track selected', enabled: false } ));
        context.append(new MenuItem({ type: 'separator' } ));


        context.append(new MenuItem({ label: 'Add to queue', click: function() { console.log('add to queue'); } }));
        context.append(new MenuItem({ label: 'Play next', click: function() { console.log('play next'); } }));

        context.popup(remote.getCurrentWindow());
    }
});
