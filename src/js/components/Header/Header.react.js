import React, { Component } from 'react';
import Input from 'react-simple-input';

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
        cover: React.PropTypes.string,
        queue: React.PropTypes.array,
        queueCursor: React.PropTypes.number,
        shuffle: React.PropTypes.bool,
        repeat: React.PropTypes.string,
        windowControls: React.PropTypes.bool,
    }

    constructor(props) {

        super(props);

        this.search = this.search.bind(null);
    }

    render() {

        return (
            <header className='row'>
                <div className='col-main-controls'>
                    <WindowControls active={ this.props.windowControls } />
                    <PlayerControls
                        playerStatus={ this.props.playerStatus }
                    />
                </div>
                <div className='col-player-infos'>
                    <PlayingBar
                        cover={ this.props.cover }
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
            </header>
        );
    }

    search(value) {
        AppActions.library.filterSearch(value.toLowerCase());
    }
}
