import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends PureComponent {

    constructor(props) {

        super(props);
    }

    render() {
        return (
            <div className='full-message'>
                { this.props.children }
            </div>
        );
    }
}
