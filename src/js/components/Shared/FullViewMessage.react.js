import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends PureComponent {

    static propTypes = {
        message: React.PropTypes.string,
        subMessage: React.PropTypes.element,
    }

    render() {
        return (
            <div className='full-message'>
                <p>{ this.props.message }</p>
                <p className='sub-message'>{ this.props.children }</p>
            </div>
        );
    }
}
