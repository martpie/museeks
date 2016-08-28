import React, { PureComponent } from 'react';
import AppActions from '../../actions/AppActions';

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

        if(!this.props.active) return null;

        return (
            <div className='window-controls'>
                <button className='window-control' onClick={ this.winClose }>&times;</button>
            </div>
        );
    }

    winClose() {
        AppActions.app.close();
    }
}
