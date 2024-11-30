import type React from 'react';
import { useEffect, useState } from 'react';

import { logAndNotifyError } from '../../lib/utils';
import * as Setting from '../Setting/Setting';

type Props = {
  value: string;
  onChange: (deviceID: string) => void;
} & Setting.InputProps;

export default function AudioOutputSelect(props: Props) {
  const { label, description, id } = props;
  const selectProps = { label, description, id };

  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const refreshDevices = async () => {
      try {
        // This will display a popup to users asking them to give microphone access,
        // which is lame because we only need outputs.
        // Does not work on macOS/linux for now.
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
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
      <Setting.Select {...selectProps} disabled key="selectDisabled">
        <option>loading devices...</option>
      </Setting.Select>
    );
  }

  if (hasError) {
    return (
      <Setting.Select {...selectProps} disabled key="selectDisabled">
        <option>Could not get audio output devices</option>
      </Setting.Select>
    );
  }

  if (devices.length === 0) {
    return (
      <Setting.Select {...selectProps} disabled key="selectDisabled">
        <option>no audio output devices found</option>
      </Setting.Select>
    );
  }

  return (
    <Setting.Select
      {...selectProps}
      key="devicesOk" // avoid default value problems
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
