import React, { Component } from 'react';

import AppActions from '../../actions/AppActions';

import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| TrackRow
|--------------------------------------------------------------------------
*/

export default class TrackRow extends Component {

    static propTypes = {
        children: React.PropTypes.object,
        selected: React.PropTypes.bool,
        trackId: React.PropTypes.string,
        index: React.PropTypes.number,
        onMouseDown: React.PropTypes.func,
        onContextMenu: React.PropTypes.func
    }

    constructor(props) {

        super(props);
        this.state = {};

        this.selectAndPlay = this.selectAndPlay.bind(this);
        this.onMouseDown   = this.onMouseDown.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
    }

    render() {

        const trackClasses = classnames('track', {
            selected: this.props.selected
        });

        return (
            <div
                className={ trackClasses }
                onDoubleClick={ this.selectAndPlay }
                onMouseDown={ this.onMouseDown }
                onContextMenu={ this.onContextMenu }
            >
                { this.props.children }
            </div>
        );
    }

    onMouseDown(e) {
        this.props.onMouseDown(e, this.props.trackId, this.props.index);
    }

    onContextMenu(e) {
        this.props.onContextMenu(e, this.props.index);
    }

    selectAndPlay() {
        AppActions.library.selectAndPlay(this.props.trackId);
    }
}
