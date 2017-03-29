import React, { PureComponent } from 'react';
import AppActions from '../../actions/AppActions';

/*
|--------------------------------------------------------------------------
| WindowControls
|--------------------------------------------------------------------------
*/

export default class WindowControls extends PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='window-controls'>
                <button className='window-control window-minimize' onClick={ this.winMinimize }>－</button> { /* U+FF0D FULLWIDTH HYPHEN-MINUS */ }
                <button className='window-control window-maximize' onClick={ this.winMaximize } /> { /* custom square with ::after */ }
                <button className='window-control window-close' onClick={ this.winClose } /> { /* custom cross with ::before and ::after */ }
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
