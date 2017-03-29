import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Icon from 'react-fontawesome';
import './styles.scss';

import { previous, next, playToggle } from '../../redux/actions/player';

/*
|--------------------------------------------------------------------------
| PlayerControls
|--------------------------------------------------------------------------
*/

class PlayerControls extends PureComponent {

    static propTypes = {
        playStatus: React.PropTypes.string,
        previous: React.PropTypes.function,
        next: React.PropTypes.function,
        playToggle: React.PropTypes.function
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { next, previous, playToggle, playStatus } = this.props;
        return (
            <div className='player-controls'>
                <button type='button' className='player-control previous' onClick={ previous }>
                    <Icon name='backward' />
                </button>
                <button className='player-control play' onClick={ playToggle }>
                    <Icon name={ playStatus === 'play' ? 'pause' : 'play' } fixedWidth />
                </button>
                <button type='button' className='player-control forward' onClick={ next }>
                    <Icon name='forward' />
                </button>
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    previous: () => previous(),
    next: () => next(),
    playToggle: () => playToggle(),
};

export default connect(stateToProps, dispatchToProps)(PlayerControls);
