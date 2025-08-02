import { useCallback } from 'react';

import * as Setting from '../components/Setting';
import type { Config } from '../generated/typings';
import { getSettingsGroup } from '../lib/settings';
import SettingCheckbox from './SettingCheckbox';

type Props = {
  type: 'audio' | 'ui' | 'library';
  config: Config;
};

export default function SettingsRenderer(props: Props) {
  const settings = getSettingsGroup(props.type);
  const config = props.config;

  // todo
  const applySetting = useCallback(
    <T extends keyof Config>(key: T, value: Config[T]) => {
      await config.set(key, value);
      await callback();
    },
    [],
  );

  return (
    <>
      {settings.map((setting) => {
        return (
          <Setting.Section key={setting.key}>
            {setting.type === 'boolean' && (
              <SettingCheckbox
                title={setting.label}
                description={setting.description}
                value={config[setting.key]}
                onChange={setting.onChange}
              />
            )}
            {setting.type === 'boolean' && (
              <SettingCheckbox
                title={setting.label}
                description={setting.description}
                value={config[setting.key]}
                onChange={setting.onChange}
              />
            )}
          </Setting.Section>
        );
      })}
    </>
  );
}
