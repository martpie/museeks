import React, { Component } from 'react';
import InlineSVG from 'svg-inline-react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| ShuffleButton
|--------------------------------------------------------------------------
*/

class ButtonShuffle extends Component {

    static propTypes = {
        shuffle: React.PropTypes.bool
    }

    constructor(props) {
        super(props);

        this.toggleShuffle = this.toggleShuffle.bind(this);
    }

    render = () => {
        const svg = require('../../../images/icons/player-shuffle.svg');

        const buttonClasses = classnames('button', {
            active: this.props.shuffle
        });

        return (
            <button type='button' className={ buttonClasses } onClick={ this.toggleShuffle }>
                <InlineSVG src={ svg } className='icon shuffle' />
            </button>
        );
    }

    toggleShuffle = () => {
        this.props.shuffle(!this.props.shuffle);
    }
}

const stateToProps = () => ({});
console.log(lib)
const dispatchToProps = {
    repeat: lib.actions.player.repeat
};

export default connect(stateToProps, dispatchToProps)(ButtonShuffle);
