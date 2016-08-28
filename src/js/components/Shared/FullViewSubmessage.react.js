import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| FullViewSubMessage
|--------------------------------------------------------------------------
*/

export default class FullViewSubMessage extends PureComponent {
    render() {
        return <p className='sub-message'>{ this.props.children }</p>;
    }
}
