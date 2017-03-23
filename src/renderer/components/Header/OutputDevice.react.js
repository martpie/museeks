import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import Popover from '../Popover'

import lib from '../../lib';

/*
|--------------------------------------------------------------------------
| RepeatButton
|--------------------------------------------------------------------------
*/

class OutputDevice extends Component {

    static propTypes = {
        setOutput: React.PropTypes.func.isRequired,
        peers: React.PropTypes.array.isRequired,
        me: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { peers, me, setOutput } = this.props;
        const allOutputs = [
            ...peers,
            me
        ];

        return (
            <div className="output-controls">

                <Popover preferPlace="below">
                    <button>Output</button>
                    <div className="PopoverMenu">
                        { allOutputs.map((output) => (
                            <button
                                key={ output.id }
                                onClick={() => setOutput(output)}>
                            { output.hostname }
                            </button>
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
