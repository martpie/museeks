import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';



/*
|--------------------------------------------------------------------------
| ShuffleButton
|--------------------------------------------------------------------------
*/

export default class ButtonShuffle extends Component {

    constructor(props) {

        super(props);
        this.state = {}
    }

    render() {

        var shuffleButton;
        var svg = require('../../../images/icons/player-shuffle.svg');

        if(!this.props.shuffle) {
            shuffleButton = (
                <button type='button' className='button' onClick={ this.shuffle }>
                    <img src={ svg } className='pf pf-shuffle' />
                </button>
            );
        } else {
            shuffleButton = (
                <button type='button' className='button active' onClick={ this.shuffle }>
                    <img src={ svg } className='pf pf-shuffle' />
                </button>
            );
        }

        return shuffleButton;
    }

    shuffle() {
        AppActions.player.shuffle();
    }
}
