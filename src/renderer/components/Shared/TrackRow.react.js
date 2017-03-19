import React, { Component } from 'react';
import { connect } from 'react-redux';

import lib from '../../lib';

import classnames from 'classnames';


/*
|--------------------------------------------------------------------------
| TrackRow
|--------------------------------------------------------------------------
*/

class TrackRow extends Component {

    static propTypes = {
        children: React.PropTypes.array,
        selected: React.PropTypes.bool,
        trackId: React.PropTypes.string,
        index: React.PropTypes.number,
        onMouseDown: React.PropTypes.func,
        onContextMenu: React.PropTypes.func
    }

    constructor(props) {
        super(props);
        this.state = {};

        this.start = this.start.bind(this);
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
                onDoubleClick={ this.start }
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

    start() {
        this.props.start(this.props.trackId);
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    start: lib.actions.player.start
};

export default connect(stateToProps, dispatchToProps)(TrackRow);
