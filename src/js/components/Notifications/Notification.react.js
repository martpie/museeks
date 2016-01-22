import React, { Component } from 'react';



/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

export default class Notifications extends Component {

    constructor(props) {

        super(props);
        this.state = {}
    }

    render() {

        var type = this.props.type,
            content = this.props.content;

        return (
            <div className={ 'alert alert-' + type }>
                { content }
            </div>
        );
    }
}
