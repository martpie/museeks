import React, { Component } from 'react';
import InlineSVG from '../Shared/InlineSVG.react';

import AppActions from '../../actions/AppActions';



/*
|--------------------------------------------------------------------------
| RepeatButton
|--------------------------------------------------------------------------
*/

export default class ButtonRepeat extends Component {

    constructor(props) {

        super(props);
        this.state = {}
    }

    render() {

        var repeatButton = <button></button>;
        var svg;

        if (this.props.repeat == 'one') {
            svg = require('../../../images/icons/player-repeat-one.svg');
            repeatButton = (
                <button className='button repeat active' onClick={ this.toggleRepeat.bind(null) }>
                    <InlineSVG src={ svg } className='pf pf-repeat-one' />
                </button>
            );
        } else if (this.props.repeat === 'all') {
            svg = require('../../../images/icons/player-repeat.svg');
            repeatButton = (
                <button className='button repeat active' onClick={ this.toggleRepeat.bind(null) }>
                    <InlineSVG src={ svg } className='pf pf-repeat' />
                </button>
            );
        } else {
            svg = require('../../../images/icons/player-repeat.svg');
            repeatButton = (
                <button className='button repeat' onClick={ this.toggleRepeat.bind(null) }>
                    <InlineSVG src={ svg } className='pf pf-repeat' />
                </button>
            );
        }

        return repeatButton;
    }

    toggleRepeat() {
        AppActions.player.repeat();
    }
}
