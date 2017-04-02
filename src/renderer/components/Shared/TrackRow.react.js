import React, { Component } from 'react';
import { connect } from 'react-redux';

import lib from '../../lib';

import classnames from 'classnames';

class TrackRow extends Component {

    static propTypes = {
        children: React.PropTypes.array,
        selected: React.PropTypes.bool,
        trackId: React.PropTypes.string,
        index: React.PropTypes.number,
        onMouseDown: React.PropTypes.func,
        onContextMenu: React.PropTypes.func,
        newQueueLoadAndPlay: React.PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const trackClasses = classnames('track', {
            selected: this.props.selected
        });

        return (
            <div
                className={ trackClasses }
                onDoubleClick={ this.newQueueLoadAndPlay }
                onMouseDown={ this.onMouseDown }
                onContextMenu={ this.onContextMenu }
            >
                { this.props.children }
            </div>
        );
    }

    newQueueLoadAndPlay = () => this.props.newQueueLoadAndPlay(this.props.trackId)

    onMouseDown = (e) => this.props.onMouseDown(e, this.props.trackId, this.props.index)

    onContextMenu = (e) => this.props.onContextMenu(e, this.props.index)
}

const stateToProps = () => ({});

const dispatchToProps = {
    newQueueLoadAndPlay: lib.actions.player.newQueueLoadAndPlay
};

export default connect(stateToProps, dispatchToProps)(TrackRow);
