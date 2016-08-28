import React, { Component } from 'react';

import Notification from './Notification.react';


/*
|--------------------------------------------------------------------------
| Notifications
|--------------------------------------------------------------------------
*/

export default class Notifications extends Component {

    static propTypes = {
        notifications: React.PropTypes.array
    }

    constructor(props) {

        super(props);
    }

    render() {
        return (
            <div className='notifications'>
                { this.props.notifications.map((notification, index) => {
                    return (
                        <Notification
                            type={ notification.type }
                            content={ notification.content }
                            key={ index }
                        />
                    );
                }) }
            </div>
        );
    }
}
