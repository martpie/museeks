import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| FullViewMessage
|--------------------------------------------------------------------------
*/

export default class FullViewMessage extends PureComponent {

    static propTypes = {
        children: React.PropTypes.object
    }

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
