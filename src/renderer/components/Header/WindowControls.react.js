import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../lib';

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
                <button className='window-control' onClick={ this.props.close() }>&times;</button>
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    close: actions.app.close
};

export default connect(stateToProps, dispatchToProps)(WindowControls);
