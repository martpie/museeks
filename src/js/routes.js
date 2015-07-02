routie({
    '/': function () {
        Instance.setState({view: views.libraryList});
    },
    '/settings': function() {
        Instance.setState({view: views.settings});
    }
});
