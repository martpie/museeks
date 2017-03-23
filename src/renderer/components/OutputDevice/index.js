import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Popover from '../Popover'

import lib from '../../lib';

import Avatar from '../Avatar'
import styles from './styles.css';

/*
|--------------------------------------------------------------------------
| OutputDevice
|--------------------------------------------------------------------------
*/

class OutputDevice extends Component {

    static propTypes = {
        setOutput: React.PropTypes.func.isRequired,
        peers: React.PropTypes.array.isRequired,
        me: React.PropTypes.object.isRequired,
        output: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { peers, me, output, setOutput } = this.props;
        const allOutputs = [
            ...peers,
            me
        ];

        const textStyle = {
            marginLeft: '10px'
        };

        return (
            <div className="output-controls">
                <Popover preferPlace="above">
                    <div className="outputDeviceTrigger">Output:<Avatar style={{marginLeft: '7px'}} name={ output.hostname } /></div>
                    <div className="PopoverMenu">
                        { allOutputs.map((option) => (
                            <a key={ option.id }
                                onClick={() => setOutput(option)}>
                                <Avatar name={ output.hostname }/>
                                <span style={ textStyle }>{ output.hostname }</span>
                            </a>
                        ))}
                    </div>
                </Popover>
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    setOutput: lib.actions.network.setOutput
};

export default connect(stateToProps, dispatchToProps)(OutputDevice);
