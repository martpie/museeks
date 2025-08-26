import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import Button from '../elements/Button';
import ExternalButton from '../elements/ExternalButton';
import ExternalLink from '../elements/ExternalLink';
import Flexbox from '../elements/Flexbox';
import Heart from '../elements/Heart';
import List from '../elements/List';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import settings, { useSettings } from '../lib/settings';
import { NON_DEFAULT_LANGUAGE } from '../translations/languages';

export const Route = createFileRoute('/settings/about')({
  component: ViewSettingsAbout,
});

function ViewSettingsAbout() {
  const { version, tauriVersion, appStorageDir } = useLoaderData({
    from: '/settings',
  });
  const config = useSettings();

  const invalidate = useInvalidate();
  const { t } = useLingui();

  return (
    <>
      <Setting.Section>
        <Setting.Title>
          <Trans>About Museeks</Trans>
        </Setting.Title>
        <Setting.Description>
          Museeks {version}
          {' - '}
          <ExternalLink href="https://museeks.io" type="url">
            museeks.io
          </ExternalLink>
          {' - '}
          <ExternalLink
            href={`https://github.com/martpie/museeks/releases/tag/${version}`}
            type="url"
          >{t`release notes`}</ExternalLink>
        </Setting.Description>
        <CheckboxSetting
          title={t`Automatically check for updates`}
          value={config.auto_update_checker}
          onChange={useInvalidateCallback(settings.toggleAutoUpdateChecker.bind(settings))}
        />
        <div>
          <Button
            onClick={() => {
              settings.checkForUpdate().then(invalidate);
            }}
          >
            <Trans>Check for update</Trans>
          </Button>
        </div>
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>
          <Trans>Contributors</Trans>
        </Setting.Title>
        <Setting.Description>
          <Trans>
            Made with <Heart /> by Pierre de la Martinière (
            <ExternalLink href="https://martpie.io" type="url">
              martpie.io
            </ExternalLink>
            ) and a bunch of{' '}
            <ExternalLink
              href="https://github.com/martpie/museeks/graphs/contributors"
              type="url"
            >
              great people
            </ExternalLink>
          </Trans>
          .
        </Setting.Description>
        <Setting.Description>
          <Trans>Translations:</Trans>
        </Setting.Description>
        <List>
          {NON_DEFAULT_LANGUAGE.map((language) => (
            <List.Item
              key={language.code}
              label={`${language.label}:`}
              content={language.contributors.join(', ')}
            />
          ))}
        </List>
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>
          <Trans>Report issue / Ask for a feature</Trans>
        </Setting.Title>
        <Setting.Description>
          <Trans>
            Bugs happen. Please, do not hesitate to report them or to ask for
            features you would like to see, using the{' '}
            <ExternalLink
              href="http://github.com/martpie/Museeks/issues"
              type="url"
            >
              issue tracker
            </ExternalLink>
            .
          </Trans>
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <Setting.Title>
          <Trans>Internals</Trans>
        </Setting.Title>
        <Setting.Description>Tauri {tauriVersion}</Setting.Description>
        <Flexbox gap={4}>
          <ExternalButton href={appStorageDir} type="filedir">
            {t`Open storage directory`}
          </ExternalButton>
        </Flexbox>
      </Setting.Section>
    </>
  );
}
