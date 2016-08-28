import React, { PureComponent } from 'react';

/*
|--------------------------------------------------------------------------
| Window controls
|--------------------------------------------------------------------------
*/

export default class WindowControls extends PureComponent {

    static propTypes = {
        active: React.PropTypes.bool,
        onClose: React.PropTypes.func
    }

    render() {
        if(!this.props.active) return null;
        return (
            <div className='window-controls'>
                <button className='window-control' onClick={ this.props.onClose }>&times;</button>
            </div>
        );
    }
}
