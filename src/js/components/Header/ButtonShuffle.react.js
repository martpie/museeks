import React, { Component } from 'react';
import InlineSVG from 'svg-inline-react';
import classnames from 'classnames';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| ShuffleButton
|--------------------------------------------------------------------------
*/

export default class ButtonShuffle extends Component {

    static propTypes = {
        shuffle: React.PropTypes.bool
    }

    constructor(props) {

        super(props);
    }

    render() {

        const svg = require('../../../images/icons/player-shuffle.svg');

        const buttonClasses = classnames('button', {
            active: this.props.shuffle
        });

        return (
            <button type='button' className={ buttonClasses } onClick={ AppActions.player.shuffle }>
                <InlineSVG src={ svg } className='icon shuffle' />
            </button>
        );
    }
}
