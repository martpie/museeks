import React, { Component } from 'react';
import { connect } from 'react-redux';
import lib from '../../lib';


import { ButtonGroup, Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import Avatar from '../Avatar';


/*
|--------------------------------------------------------------------------
| Child - Network Settings
|--------------------------------------------------------------------------
*/

class SettingsAdvanced extends Component {

    static propTypes = {
        config: React.PropTypes.object
    }

    constructor(props) {
        super(props);
    }

    render() {
        const { config, network, findPeers } = this.props;

        const allMuseeks = [
            ...network.peers,
            network.me
        ];

        const getIcon = (platform) => {
            if (platform === 'win32') {
                return 'fa-windows'
            } else if (platform === 'darwin') {
                return 'fa-apple'
            } else {
                return 'fa-linux'
            }
        };

        const buttonsGroup = (
            <ButtonGroup>
                <Button bsSize='small' onClick={ findPeers }>
                    <Icon name='refresh' />
                      { 'Scan Network' }
                </Button>
            </ButtonGroup>
        );

        return (
            <div className='setting setting-network'>
                <div className='setting-section'>
                    <h4>Network</h4>
                    <p>Scan your local network for other instances of Museeks. This will combine your music libraries and allow remote playback.</p>
                    <div>
                        { allMuseeks.map((instance) => (
                            <div className='network-row' key={instance.hostname}>
                                <Avatar name={ instance.hostname }/>
                                <div className='platform'><i className={'fa ' + getIcon(instance.platform)} aria-hidden="true"></i></div>
                                <div className='name'>{ instance.hostname } { instance.hostname === network.me.hostname && <span>&nbsp;(this computer)</span>}</div>
                                { instance.ip && <div className='ip'>{ instance.ip }</div> }
                                { instance.ips && <div className='ip'>{ instance.ips.map(ip => <span>{ ip }</span> )}</div> }
                            </div>
                        )) }
                    </div>
                    { buttonsGroup }
                </div>
            </div>
        );
    }
}

const stateToProps = (state) => ({
      network: state.network
});


const dispatchToProps = {
    findPeers: lib.actions.settings.toggleDevMode
};

export default connect(stateToProps, dispatchToProps)(SettingsAdvanced);
