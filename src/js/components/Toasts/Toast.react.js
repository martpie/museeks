import React, { Component } from 'react';


/*
|--------------------------------------------------------------------------
| Toast
|--------------------------------------------------------------------------
*/

export default class Toast extends Component {

    static propTypes = {
        type: React.PropTypes.string,
        content: React.PropTypes.string
    }

    constructor(props) {

        super(props);
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
