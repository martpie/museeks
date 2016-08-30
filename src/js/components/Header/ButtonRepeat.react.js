import React, { Component } from 'react';
import InlineSVG from 'svg-inline-react';
import classnames from 'classnames';

import AppActions from '../../actions/AppActions';

const svgMap = {
    one: require('../../../images/icons/player-repeat-one.svg'),
    all: require('../../../images/icons/player-repeat.svg'),
    default: require('../../../images/icons/player-repeat.svg')
};

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
    }

    render() {

        const svg = svgMap[this.props.repeat] || svgMap.default;
        const buttonClasses = classnames('button repeat',{
            active: this.props.repeat === 'one' || this.props.repeat === 'all'
        });

        const svgClasses = classnames('icon', {
            'repeat-one': this.props.repeat === 'one',
            'repeat': this.props.repeat !== 'one'
        });

        return (
            <button className={ buttonClasses } onClick={ AppActions.player.repeat }>
                <InlineSVG src={ svg } className={ svgClasses } />
            </button>
        );
    }
}
