import React, { Component } from 'react';
import Input from 'react-simple-input';
import KeyBinding from 'react-keybinding-component';

import PlayingBar     from './PlayingBar.react';
import WindowControls from './WindowControls.react';
import PlayerControls from './PlayerControls.react';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| Header
|--------------------------------------------------------------------------
*/

export default class Header extends Component {

    static propTypes = {
        playerStatus: React.PropTypes.string,
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        shuffle: React.PropTypes.bool,
        repeat: React.PropTypes.string,
        windowControls: React.PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this.onKey = this.onKey.bind(this);
    }

    render() {
        return (
            <header>
                <div className='top-header'>
                    <WindowControls active={ this.props.windowControls } />
                </div>
                <div className='main-header'>
                    <div className='col-main-controls'>
                        <PlayerControls
                            playerStatus={ this.props.playerStatus }
                        />
                    </div>
                    <div className='col-player-infos'>
                        <PlayingBar
                            queue={ this.props.queue }
                            queueCursor={ this.props.queueCursor }
                            shuffle={ this.props.shuffle }
                            repeat={ this.props.repeat }
                        />
                    </div>
                    <div className="col-search-controls">
                        <Input
                            selectOnClick
                            placeholder='search'
                            className='form-control input-sm search'
                            changeTimeout={ 250 }
                            clearButton
                            ref='search'
                            onChange={ this.search }
                        />
                    </div>
                </div>
                <KeyBinding onKey={ this.onKey } preventInputConflict />
            </header>
        );
    }

    search(e) {
        AppActions.library.filterSearch(e.target.value);
    }

    onKey(e) {
        switch (e.keyCode) {
            case 70: { // "F"
                if(e.ctrlKey) {
                    this.refs.search.refs.input.select();
                }
            }
        }
    }
}
