import React, { Component } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import SettingsLibrary  from './SettingsLibrary.react';
import SettingsUI       from './SettingsUI.react';
import SettingsAudio    from './SettingsAudio.react';
import SettingsAdvanced from './SettingsAdvanced.react';
import SettingsAbout    from './SettingsAbout.react';


/*
|--------------------------------------------------------------------------
| Global View
|--------------------------------------------------------------------------
*/

export default class Settings extends Component {

    static propTypes = {
        config: React.PropTypes.object.isRequired,
        refreshingLibrary: React.PropTypes.bool,
        refreshProgress: React.PropTypes.number
    }

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        let config = this.props.config;

        return (
            <div className='view view-settings'>
                <Tabs defaultActiveKey={ 0 } animation={ false } bsStyle='pills' className='settings-switcher'>
                    <Tab eventKey={ 0 } title='Library'>
                        <SettingsLibrary config={ config } refreshingLibrary={ this.props.refreshingLibrary } refreshProgress={ this.props.refreshProgress } />
                    </Tab>
                    <Tab eventKey={ 1 } title='Audio'>
                        <SettingsAudio config={ config } />
                    </Tab>
                    <Tab eventKey={ 2 } title='Interface'>
                        <SettingsUI config={ config } />
                    </Tab>
                    <Tab eventKey={ 3 } title='Advanced'>
                        <SettingsAdvanced config={ config } />
                    </Tab>
                    <Tab eventKey={ 4 } title='About'>
                        <SettingsAbout />
                    </Tab>
                </Tabs>
            </div>
        );
    }
}
