import * as React from 'react';

import ExternalLink from '../../elements/ExternalLink/ExternalLink';
import Heart from '../../elements/Heart/Heart';
import * as Setting from '../../components/Setting/Setting';

import * as app from '../../lib/app';
import * as SettingsActions from '../../actions/SettingsActions';
import Button from '../../elements/Button/Button';

export default class SettingsAbout extends React.Component {
  render () {
    return (
      <div className='setting setting-about'>
        <Setting.Section>
        <h3 style={{ marginTop: 0 }}>About Museeks</h3>
          <p>
            Museeks { app.version }{ ' - ' }
            <ExternalLink href='http://museeks.io'>museeks.io</ExternalLink>
            { ' - ' }
            <ExternalLink href={`https://github.com/martpie/museeks/releases/tag/${app.version}`}>release notes</ExternalLink>
          </p>
          <Button
            onClick={async () => { await SettingsActions.checkForUpdate(); }}
          >Check for update</Button>
        </Setting.Section>
        <Setting.Section>
          <h3>Contributors</h3>
          <p>
            Made with <Heart /> by Pierre de la Martinière
            (<ExternalLink href='https://martpie.io'>@martpie</ExternalLink>)
            and a bunch of <ExternalLink href='https://github.com/martpie/museeks/graphs/contributors'>great people</ExternalLink>.
          </p>
        </Setting.Section>
        <Setting.Section>
          <h3>Report issue / Ask for a feature</h3>
          <p>
            Although Museeks is mostly stable, a few bugs may still occur. Please, do
            not hesitate to report them or to ask for features you would like to
            see, using the <ExternalLink href='http://github.com/martpie/Museeks/issues'>issue tracker</ExternalLink>.
          </p>
        </Setting.Section>
      </div>
    );
  }
}
