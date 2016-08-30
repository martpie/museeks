import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

import ExternalLink from '../Shared/ExternalLink.react';

import app   from '../../lib/app';

import AppActions from '../../actions/AppActions';

// sth wrong with that, need some check with Webpack
const museeksLogoRequire = require('../../../images/logos/museeks.png');
const museeksLogo = `dist/${museeksLogoRequire}`;


/*
|--------------------------------------------------------------------------
| Child - About
|--------------------------------------------------------------------------
*/

export default class SettingsAbout extends Component {

    constructor(props) {

        super(props);
    }

    render() {

        return (
            <div className='setting setting-about'>
                <div className='setting-section'>
                    <h4>About Museeks</h4>
                    <img src={ museeksLogo } className='logo-museeks' alt='Logo' title='Museeks logo' />
                    <p>
                        Museeks { app.version }{ ' - ' }
                        <ExternalLink href='http://museeks.io'>museeks.io</ExternalLink>
                        { ' - ' }
                        <ExternalLink href={ `https://github.com/KeitIG/Museeks/releases/tag/${app.version}` }>release notes</ExternalLink>
                        <Button bsSize='small' className='update-checker' onClick={ AppActions.settings.checkForUpdate }>Check for update</Button>
                    </p>
                </div>
                <div className='setting-section'>
                    <h4>Contributors</h4>
                    <div className='contributors-list'>
                        <p>
                            Made with <span className='heart'>♥</span> by Pierre de la Martinière (<ExternalLink href='http://pierrevanmart.com'>KeitIG</ExternalLink>) and a bunch of <ExternalLink href='https://github.com/KeitIG/museeks/graphs/contributors'>great people</ExternalLink>.
                        </p>
                    </div>
                </div>
                <div className='setting-section'>
                    <h4>Report issue / Ask for a feature</h4>
                    <div className='contributors-list'>
                        <p>
                            Although Museeks is mostly stable, a few bugs may still occur. Do not hesitate to report them or to ask for features you would like to see using our <ExternalLink href='http://github.com/KeitIG/Museeks/issues'>issue tracker</ExternalLink>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}
