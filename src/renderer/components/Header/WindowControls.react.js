import React, { PureComponent } from 'react';
import { api, actions } from '../../library';

/*
|--------------------------------------------------------------------------
| WindowControls
|--------------------------------------------------------------------------
*/

export default class WindowControls extends PureComponent {

    static propTypes = {
        active: React.PropTypes.bool
    }

    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.active) return null;

        return (
            <div className='window-controls'>
                <button className='window-control' onClick={ this.winClose }>&times;</button>
            </div>
        );
    }

    winClose() {
        actions.close();
    }
}
