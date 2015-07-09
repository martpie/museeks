alerts = {

    add: function (type, content) {

        var id = new Date().getTime();
        var notifications = Instance.state.notifications;

        notifications[id] = { type: type, content: content };

        Instance.setState({ notifications : notifications });

        setTimeout(function () {

            var newNotifications = Instance.state.notifications;
            delete newNotifications[id];

            Instance.setState({ notifications : newNotifications });

        }, 5000);
    }
};
