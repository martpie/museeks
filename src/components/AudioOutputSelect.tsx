import { useLingui } from '@lingui/react/macro';
import type React from 'react';
import { useEffect, useState } from 'react';
import { logAndNotifyError } from '../lib/utils';
import * as Setting from './Setting';

type Props = {
  value: string;
  onChange: (deviceID: string) => void;
} & Setting.InputProps;

export default function AudioOutputSelect(props: Props) {
  const { label, description, id } = props;
  const selectProps = { label, description, id };
  const { t } = useLingui();

  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const refreshDevices = async () => {
      try {
        // Webkit sucks, we need to request permissions for inputs, when we only
        // need outputs
        // const test = await navigator.mediaDevices.getUserMedia({
        //   audio: true,
        //   video: false,
        // });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(
          (device) => device.kind === 'audiooutput' && device.deviceId !== '',
        );

        setDevices(audioDevices);
      } catch (err) {
        setDevices([]);
        setHasError(true);
        logAndNotifyError(err);
      }
    };

    refreshDevices();
  }, []);

  const setAudioOutputDevice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChange(e.currentTarget.value);
  };

  if (!devices) {
    return (
      <Setting.Select key="selectDisabled" disabled {...selectProps}  >
        <option>{t`Loading devices...`}</option>
      </Setting.Select>
    );
  }

  if (hasError) {
    return (
      <Setting.Select key="selectDisabled" disabled  {...selectProps}>
        <option>{t`Could not get audio output devices`}</option>
      </Setting.Select>
    );
  }

  if (devices.length === 0) {
    return (
      <Setting.Select key="selectDisabled" disabled  {...selectProps}>
        <option>{t`No audio devices found`}</option>
      </Setting.Select>
    );
  }

  return (
    <Setting.Select
      key="devicesOk" // avoid default value problems
      {...selectProps}
      value={props.value}
      onChange={setAudioOutputDevice}
    >
      {devices.map((device) => {
        return (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        );
      })}
    </Setting.Select>
  );
}
