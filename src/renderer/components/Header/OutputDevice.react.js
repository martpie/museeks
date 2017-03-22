import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

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
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { peers, setOutput } = this.props;
        return (
            <div className="output-controls">
                { peers.map((peer) => (
                    <button style={{marginLeft: '15px'}}
                        key={ peer.id }
                        onClick={() => setOutput(peer)}>
                    { peer.hostname }
                    </button>
                ))}
            </div>
        );
    }
}

const stateToProps = () => ({});

const dispatchToProps = {
    setOutput: lib.actions.network.setOutput
};

export default connect(stateToProps, dispatchToProps)(OutputDevice);
