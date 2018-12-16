import * as React from 'react';
import { Button } from 'react-bootstrap';

import ExternalLink from '../Shared/ExternalLink';

import * as app from '../../lib/app';
import * as SettingsActions from '../../actions/SettingsActions';

/*
|--------------------------------------------------------------------------
| Child - About
|--------------------------------------------------------------------------
*/

export default class SettingsAbout extends React.Component {
  render () {
    return (
      <div className='setting setting-about'>
        <div className='setting-section'>
          <h4>About Museeks</h4>
          <p>
            Museeks { app.version }{ ' - ' }
            <ExternalLink href='http://museeks.io'>museeks.io</ExternalLink>
            { ' - ' }
            <ExternalLink href={`https://github.com/KeitIG/Museeks/releases/tag/${app.version}`}>release notes</ExternalLink>
          </p>
          <Button
            bsSize='small' className='update-checker'
            onClick={async () => { await SettingsActions.checkForUpdate(); }}
          >Check for update</Button>
        </div>
        <div className='setting-section'>
          <h4>Contributors</h4>
          <div className='contributors-list'>
            <p>
              Made with <span className='heart'>♥</span> by Pierre de la Martinière
              (<ExternalLink href='http://pierrevanmart.com'>KeitIG</ExternalLink>)
              and a bunch of <ExternalLink href='https://github.com/KeitIG/museeks/graphs/contributors'>great people</ExternalLink>.
            </p>
          </div>
        </div>
        <div className='setting-section'>
          <h4>Report issue / Ask for a feature</h4>
          <div className='contributors-list'>
            <p>
              Although Museeks is mostly stable, a few bugs may still occur. Please, do
              not hesitate to report them or to ask for features you would like to
              see, using our <ExternalLink href='http://github.com/KeitIG/Museeks/issues'>issue tracker</ExternalLink>.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
