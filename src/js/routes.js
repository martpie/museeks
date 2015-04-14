routie({
    '/': function () {
        Instance.setState({view: views.libraryList});
    },
    '/library-columns': function() {
        Instance.setState({view: views.libraryColumns});
    },
    '/settings': function() {
        Instance.setState({view: views.settings});
    },
    '*': function() {
        alerts.add('warning', 'You tried to access an undefined view !');
        routie('/');
    }
});
