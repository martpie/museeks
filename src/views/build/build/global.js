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
        }
    },

    componentWillMount: function () {
        this.refreshLibrary();
    },

    render: function () {

        var status = this.getStatus();

        return (
            React.createElement("div", {className: 'main'}, 
                React.createElement(Header, null), 
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
                React.createElement("div", {className: 'window-controls col-sm-1 text-left'}, 
                    React.createElement("button", {className: 'control control-close', title: 'Close', onClick:  this.win.close}), 
                    React.createElement("button", {className: 'control control-minimize', title: 'Minimize', onClick:  this.win.minimize}), 
                    React.createElement("button", {className: 'control control-maximize', title: 'Maximize', onClick:  this.win.maximize})
                ), 
                React.createElement("div", {className: 'col-sm-9'}
                    /* music status will go here */
                ), 
                React.createElement("div", {className: 'col-sm-2 search'}, 
                    React.createElement("input", {type: 'text', className: 'form-control input-sm', placeholder: 'search', onChange:  this.search})
                )

            )
        );
    },

    win: {
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



/*
|--------------------------------------------------------------------------
| Footer
|--------------------------------------------------------------------------
*/

var Footer = React.createClass({displayName: "Footer",
    getInitialState: function () {
        return {
            showPlaylist: false
        };
    },

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
                React.createElement("div", {className: "status col-sm-6 text-center"}, 
                     this.props.status
                ), 
                React.createElement("div", {className: "col-sm-3 text-right player-controls"}, 
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
