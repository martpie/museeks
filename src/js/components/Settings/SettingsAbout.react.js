import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

import AppActions from '../../actions/AppActions';

const shell = electron.shell;



/*
|--------------------------------------------------------------------------
| Child - Contributors List
|--------------------------------------------------------------------------
*/

export default class ContributorsList extends Component {

    constructor(props) {

        super(props);
        this.state = {};
    }

    render() {

        var self = this;
        
        // Don't add yourself here please, I'll do it myself
        var contributors = [
            {
                name: 'Moritz',
                pseudo: 'mrzmyr',
                feature: 'repeat feature',
                url: 'https://github.com/mrzmyr'
            },
            {
                name: 'Jonathan Alpay',
                pseudo: 'Suriteka',
                feature: 'icons editing',
                url: 'http://twitter.com/Suriteka '
            }
        ];

        var contributorsList = contributors.map(function(data, index) {
            return (
                <li key={ index }>{ data.name } (<a href onClick={ self.openLink.bind(null, data.url) }>{ data.pseudo }</a>): { data.feature }</li>
            )
        });

        return (
            <div className='setting setting-about'>
                <div className='setting-section'>
                    <h4>About Museeks</h4>
                    <p>
                        Museeks { electron.remote.app.getVersion() } - <a href onClick={ self.openLink.bind(null, 'http://museeks.io') }>museeks.io</a>
                        <Button bsSize='small'  className='update-checker' onClick={ this.checkForUpdate.bind(null) }>Check for update</Button>
                    </p>
                </div>
                <div className='setting-section'>
                    <h4>Contributors</h4>
                    <div className='contributors-list'>
                        <p>Made with <span className='heart'>♥</span> by Pierre de la Martinière (<a href onClick={ this.openLink.bind(null, 'http://github.com/KeitIG') }>KeitIG</a>) and a bunch of great guys:</p>
                        <ul>
                            { contributorsList }
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    openLink(link, e) {
        e.preventDefault();
        shell.openExternal(link);
    }

    checkForUpdate() {
        AppActions.app.checkForUpdate();
    }
}
