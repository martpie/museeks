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
                <button className='window-control window-close' onClick={ this.winClose }>&#10005;</button> { /* U+00D7 MULTIPLICATION SIGN */ }
                <button className='window-control window-minimize' onClick={ this.winMinimize }>－</button> { /* U+FF0D FULLWIDTH HYPHEN-MINUS */ }
                <button className='window-control window-maximize' onClick={ this.winMaximize } /> { /* custom square with ::after */ }
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
