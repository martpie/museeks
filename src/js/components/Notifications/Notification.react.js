import React, { Component } from 'react';


/*
|--------------------------------------------------------------------------
| Notification
|--------------------------------------------------------------------------
*/

export default class Notifications extends Component {

    static propTypes = {
        type: React.PropTypes.string,
        content: React.PropTypes.string
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        const type = this.props.type;
        const content = this.props.content;

        return (
            <div className={ `alert alert-${type}` }>
                { content }
            </div>
        );
    }
}
