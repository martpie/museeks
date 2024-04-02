import { useLoaderData } from 'react-router-dom';

import ExternalLink from '../elements/ExternalLink/ExternalLink';
import Heart from '../elements/Heart/Heart';
import * as Setting from '../components/Setting/Setting';
import SettingsAPI from '../stores/SettingsAPI';
import Button from '../elements/Button/Button';
import ExternalButton from '../elements/ExternalButton/ExternalButton';
import Flexbox from '../elements/Flexbox/Flexbox';

import { SettingsLoaderData } from './ViewSettings';

export default function ViewSettingsAbout() {
  const { version, tauriVersion, appConfigDir, appLocalDataDir } =
    useLoaderData() as SettingsLoaderData;

  return (
    <div className="setting setting-about">
      <Setting.Section>
        <h3 style={{ marginTop: 0 }}>About Museeks</h3>
        <p>
          Museeks {version}
          {' - '}
          <ExternalLink href="http://museeks.io">museeks.io</ExternalLink>
          {' - '}
          <ExternalLink
            href={`https://github.com/martpie/museeks/releases/tag/${version}`}
          >
            release notes
          </ExternalLink>{' '}
        </p>
        <Button
          onClick={async () => {
            await SettingsAPI.checkForUpdate();
          }}
        >
          Check for update
        </Button>
      </Setting.Section>
      <Setting.Section>
        <h3>Contributors</h3>
        <p>
          Made with <Heart /> by Pierre de la Martinière (
          <ExternalLink href="https://martpie.io">@martpie</ExternalLink>) and a
          bunch of{' '}
          <ExternalLink href="https://github.com/martpie/museeks/graphs/contributors">
            great people
          </ExternalLink>
          .
        </p>
      </Setting.Section>
      <Setting.Section>
        <h3>Report issue / Ask for a feature</h3>
        <p>
          Bugs happens. Please, do not hesitate to report them or to ask for
          features you would like to see, using the{' '}
          <ExternalLink href="http://github.com/martpie/Museeks/issues">
            issue tracker
          </ExternalLink>
          .
        </p>
      </Setting.Section>
      <Setting.Section>
        <h3>Internals</h3>
        <p>Tauri {tauriVersion}</p>
        <Flexbox gap={4}>
          <ExternalButton href={appConfigDir}>
            Open config directory
          </ExternalButton>
          <ExternalButton href={appLocalDataDir}>
            Open local data directory
          </ExternalButton>
        </Flexbox>
      </Setting.Section>
    </div>
  );
}
