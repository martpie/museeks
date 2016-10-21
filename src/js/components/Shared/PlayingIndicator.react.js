import React, { Component } from 'react';
import Icon from 'react-fontawesome';

import classnames from 'classnames';

import AppActions from '../../actions/AppActions';


/*
|--------------------------------------------------------------------------
| PlayingIndicator
|--------------------------------------------------------------------------
*/

export default class TrackRow extends Component {

    static propTypes = {
        state: React.PropTypes.string.isRequired,
    }

    constructor(props) {

        super(props);
        this.state = {
            hovered: false
        };

        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
    }

    render() {

        const classNames = classnames({
            'hovered': this.state.hovered,
        }, this.props.state, 'playing-indicator');

        const content = this.getContent(this.props.state, this.state.hovered);

        return (
            <div className={ classNames }
                onClick={ AppActions.player.playToggle }
                onMouseEnter={ this.onMouseEnter }
                onMouseLeave= { this.onMouseLeave }
            >
                <div className="playing-indicator">
                    { content }
                </div>
            </div>
        );
    }

    getContent(state, hovered) {

        if(state === 'play') {

            if(hovered) {
                return <Icon name='pause' fixedWidth />;
            }

            return (
                <div className="animation">
                    <div className="bar bar-first" />
                    <div className="bar bar-second" />
                    <div className="bar bar-third" />
                </div>
            );
        }

        return <Icon name='play' fixedWidth />;
    }

    onMouseEnter() {

        this.setState({ hovered: true });
    }

    onMouseLeave() {

        this.setState({ hovered: false });
    }
}
