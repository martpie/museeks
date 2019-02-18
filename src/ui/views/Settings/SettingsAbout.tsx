import * as React from 'react';

import ExternalLink from '../../elements/ExternalLink';
import Heart from '../../elements/Heart';
import * as Setting from '../../components/Setting/Setting';

import * as app from '../../lib/app';
import * as SettingsActions from '../../actions/SettingsActions';

export default class SettingsAbout extends React.Component {
  render () {
    return (
      <div className='setting setting-about'>
        <Setting.Section>
          <h4>About Museeks</h4>
          <p>
            Museeks { app.version }{ ' - ' }
            <ExternalLink href='http://museeks.io'>museeks.io</ExternalLink>
            { ' - ' }
            <ExternalLink href={`https://github.com/martpie/Museeks/releases/tag/${app.version}`}>release notes</ExternalLink>
          </p>
          <button
            onClick={async () => { await SettingsActions.checkForUpdate(); }}
          >Check for update</button>
        </Setting.Section>
        <Setting.Section>
          <h4>Contributors</h4>
          <p>
            Made with <Heart /> by Pierre de la Martinière
            (<ExternalLink href='http://pierrevanmart.com'>@martpie</ExternalLink>)
            and a bunch of <ExternalLink href='https://github.com/martpie/museeks/graphs/contributors'>great people</ExternalLink>.
          </p>
        </Setting.Section>
        <Setting.Section>
          <h4>Report issue / Ask for a feature</h4>
          <p>
            Although Museeks is mostly stable, a few bugs may still occur. Please, do
            not hesitate to report them or to ask for features you would like to
            see, using our <ExternalLink href='http://github.com/martpie/Museeks/issues'>issue tracker</ExternalLink>.
          </p>
        </Setting.Section>
      </div>
    );
  }
}
