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
                <button className='window-control fa fa-window-close' onClick={ this.winClose } />
                <button className='window-control fa fa-window-minimize' onClick={ this.winMinimize } />
                <button className='window-control fa fa-window-maximize' onClick={ this.winMaximize } />
            </div>
        );
    }

    winClose() {
        AppActions.close();
    }

    winMinimize() {
        AppActions.minimize();
    }

    winMaximize() {
        AppActions.maximize();
    }
}
