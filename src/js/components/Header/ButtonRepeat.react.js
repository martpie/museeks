import React, { Component } from 'react';
import InlineSVG from 'svg-inline-react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| RepeatButton
|--------------------------------------------------------------------------
*/

export default class ButtonRepeat extends Component {

    static propTypes = {
        repeat: React.PropTypes.string
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let repeatButton = <button></button>;
        let svg;

        if (this.props.repeat === 'one') {
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
