import React, { PureComponent } from 'react';
import { api, actions } from '../../lib';

/*
|--------------------------------------------------------------------------
| WindowControls
|--------------------------------------------------------------------------
*/

class WindowControls extends PureComponent {

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
        this.props.close();
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    close: actions.close
};

export default connect(stateToProps, dispatchToProps)(WindowControls);
