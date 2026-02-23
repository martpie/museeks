import { Trans, useLingui } from '@lingui/react/macro';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useState } from 'react';

import * as Setting from '../components/Setting';
import CheckboxSetting from '../components/SettingCheckbox';
import Button from '../elements/Button';
import useInvalidate from '../hooks/useInvalidate';
import ConfigBridge from '../lib/bridge-config';
import LastfmBridge from '../lib/bridge-lastfm';

export const Route = createFileRoute('/settings/scrobbling')({
  component: ViewSettingsScrobbling,
});

function ViewSettingsScrobbling() {
  const { config } = useLoaderData({ from: '/settings' });
  const { t } = useLingui();
  const invalidate = useInvalidate();

  const [isConnecting, setIsConnecting] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const authData = await LastfmBridge.getAuthUrl();
      setAuthToken(authData.token);

      // Open the authorization URL in the user's browser
      openUrl(authData.url);
    } catch (err) {
      setError(t`Failed to start Last.fm authentication. Please try again.`);
      setIsConnecting(false);
    }
  };

  const handleCompleteAuth = async () => {
    if (!authToken) return;

    try {
      await LastfmBridge.getSession(authToken);
      setAuthToken(null);
      setIsConnecting(false);
      await invalidate();
    } catch (err) {
      setError(
        t`Failed to complete authentication. Make sure you authorized the app on Last.fm.`,
      );
    }
  };

  const handleDisconnect = async () => {
    try {
      await LastfmBridge.disconnect();
      await invalidate();
    } catch (err) {
      setError(t`Failed to disconnect from Last.fm.`);
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    await ConfigBridge.set('lastfm_enabled', enabled);
    await invalidate();
  };

  const isConnected = Boolean(config.lastfm_session_key);

  return (
    <>
      <Setting.Section>
        <Setting.Title>{t`Last.fm Integration`}</Setting.Title>
        <Setting.Description>
          <Trans>
            Connect your Last.fm account to scrobble tracks and share your
            listening history.
          </Trans>
        </Setting.Description>
      </Setting.Section>

      {!isConnected && !isConnecting && (
        <Setting.Section>
          <Button type="button" onClick={handleConnect}>
            {t`Connect to Last.fm`}
          </Button>
          {error && <Setting.ErrorMessage>{error}</Setting.ErrorMessage>}
        </Setting.Section>
      )}

      {isConnecting && authToken && (
        <Setting.Section>
          <Setting.Description>
            <Trans>
              A browser window has been opened. Please authorize Museeks on
              Last.fm, then click the button below to complete the connection.
            </Trans>
          </Setting.Description>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button type="button" onClick={handleCompleteAuth}>
              {t`I've authorized Museeks`}
            </Button>
            <Button
              type="button"
              bSize="small"
              onClick={() => {
                setIsConnecting(false);
                setAuthToken(null);
                setError(null);
              }}
            >
              {t`Cancel`}
            </Button>
          </div>
          {error && <Setting.ErrorMessage>{error}</Setting.ErrorMessage>}
        </Setting.Section>
      )}

      {isConnected && (
        <>
          <Setting.Section>
            <Setting.Description>
              <Trans>
                Connected as <strong>{config.lastfm_username}</strong>
              </Trans>
            </Setting.Description>
            <Button
              type="button"
              bSize="small"
              onClick={handleDisconnect}
              style={{ marginTop: '0.5rem' }}
            >
              {t`Disconnect`}
            </Button>
          </Setting.Section>

          <Setting.Section>
            <CheckboxSetting
              title={t`Enable scrobbling`}
              description={t`Send your listening history to Last.fm`}
              value={config.lastfm_enabled}
              onChange={() => handleToggleEnabled(!config.lastfm_enabled)}
            />
          </Setting.Section>
        </>
      )}
    </>
  );
}
