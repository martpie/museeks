routie({
    '/': function () {
        Instance.setState({view: views.libraryList});
    },
    '/settings': function() {
        Instance.setState({view: views.settings});
    },
    '*': function() {
        alerts.add('warning', 'You tried to access an undefined view !');
        routie('/');
    }
});
