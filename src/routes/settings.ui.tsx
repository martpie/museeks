import { t as tMacro } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { relaunch } from '@tauri-apps/plugin-process';
import { debounce } from 'lodash-es';
import { useMemo } from 'react';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import Button from '../elements/Button';
import type { Config, DefaultView } from '../generated/typings';
import useInvalidate, { useInvalidateCallback } from '../hooks/useInvalidate';
import SettingsBridge from '../lib/bridge-settings';
import { themes } from '../lib/themes';
import SettingsAPI, { DEFAULT_MAIN_COLOR } from '../stores/SettingsAPI';
import {
  DEFAULT_LANGUAGE,
  NON_DEFAULT_LANGUAGES,
} from '../translations/languages';

export const Route = createFileRoute('/settings/ui')({
  component: ViewSettingsUI,
});

function ViewSettingsUI() {
  const { config } = useLoaderData({ from: '/settings' });
  const { t } = useLingui();

  const invalidate = useInvalidate();

  const setUIMainColorThrottled = useMemo(() => {
    return debounce((value: string) => {
      SettingsAPI.setUIMainColor(value).then(invalidate);
    }, 250);
  }, [invalidate]);

  return (
    <>
      <Setting.Section>
        <Setting.Select
          label={t`Theme`}
          description={t`Change the appearance of the interface`}
          value={config.theme}
          onChange={(e) =>
            SettingsAPI.setTheme(e.currentTarget.value).then(invalidate)
          }
        >
          <option value="__system">{t`System (default)`}</option>
          {Object.values(themes).map((theme) => {
            return (
              <option key={theme._id} value={theme._id}>
                {getTranslatedThemeName(theme.name)}
              </option>
            );
          })}
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.ColorSelector
          label={t`Accent color`}
          value={config.ui_accent_color ?? DEFAULT_MAIN_COLOR}
          description={
            <Button
              type="button"
              bSize="small"
              onClick={() => {
                SettingsAPI.setUIMainColor(DEFAULT_MAIN_COLOR).then(invalidate);
                SettingsAPI.applyUIMainColorToUI(DEFAULT_MAIN_COLOR);
              }}
            >{t`Reset`}</Button>
          }
          onChange={(e) => {
            const value = e.currentTarget.value;
            SettingsAPI.applyUIMainColorToUI(value);
            setUIMainColorThrottled(value);
          }}
        />
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label={t`Language`}
          value={config.language}
          onChange={(e) => {
            SettingsAPI.setLanguage(e.target.value).then(invalidate);
          }}
          data-testid="language-selector"
        >
          <option value={DEFAULT_LANGUAGE.code}>
            {DEFAULT_LANGUAGE.label}
          </option>
          <option disabled>──────────</option>
          {NON_DEFAULT_LANGUAGES.map((language) => {
            return (
              <option key={language.code} value={language.code}>
                {language.label}
                {language.englishLabel && ` (${language.englishLabel})`}
              </option>
            );
          })}
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label={t`Tracks density`}
          description={t`Change the tracks spacing`}
          value={config.track_view_density}
          onChange={(e) =>
            SettingsAPI.setTracksDensity(
              e.currentTarget.value as Config['track_view_density'],
            ).then(invalidate)
          }
        >
          <option value="normal">
            <Trans>Normal (default)</Trans>
          </option>
          <option value="compact">
            <Trans>Compact</Trans>
          </option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <Setting.Select
          label={t`Default view`}
          value={config.default_view}
          description={t`Change the default view when starting the application`}
          onChange={(e) =>
            SettingsBridge.setDefaultView(
              e.currentTarget.value as DefaultView,
            ).then(invalidate)
          }
        >
          <option value="Library">
            <Trans>Library (default)</Trans>
          </option>
          <option value="Artists">
            <Trans>Artists</Trans>
          </option>
          <option value="Playlists">
            <Trans>Playlists</Trans>
          </option>
        </Setting.Select>
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          title={t`Display Notifications`}
          description={t`Send notifications when the playing track changes`}
          value={config.notifications}
          onChange={useInvalidateCallback(
            SettingsAPI.toggleDisplayNotifications,
          )}
        />
      </Setting.Section>
      <Setting.Section>
        <CheckboxSetting
          title={t`Sleep mode blocker`}
          description={t`Prevent the computer from going into sleep mode when playing`}
          value={config.sleepblocker}
          onChange={useInvalidateCallback(SettingsBridge.toggleSleepBlocker)}
        />
      </Setting.Section>
      {window.__MUSEEKS_PLATFORM === 'linux' && (
        <Setting.Section>
          <CheckboxSetting
            title={t`[Beta] Wayland compatibility enhancements`}
            description={t`If you face issues using Wayland, try out this option`}
            value={config.wayland_compat}
            onChange={() =>
              SettingsBridge.toggleWaylandCompat(!config.wayland_compat).then(
                async () => {
                  await invalidate();
                  await relaunch();
                },
              )
            }
          />
        </Setting.Section>
      )}
    </>
  );
}

/**
 * Get the theme name in the current language
 */
export function getTranslatedThemeName(themeName: string) {
  switch (themeName) {
    case 'Light':
      return tMacro`Light`;
    case 'Dark':
      return tMacro`Dark`;
  }

  return themeName;
}
