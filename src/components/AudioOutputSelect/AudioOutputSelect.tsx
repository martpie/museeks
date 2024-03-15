import React, { useEffect, useState } from 'react';

import * as Setting from '../Setting/Setting';
import { logAndNotifyError } from '../../lib/utils';

type Props = {
  defaultValue: string;
  onChange: (deviceID: string) => void;
};

export default function AudioOutputSelect(props: Props) {
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
        // console.log('media', test);
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log('all devices', devices);
        const audioDevices = devices.filter(
          (device) => device.kind === 'audiooutput',
        );
        // console.log('audioDevices', audioDevices);
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
      <Setting.Select disabled key="selectDisabled">
        <option>loading devices...</option>
      </Setting.Select>
    );
  }

  if (hasError) {
    return (
      <Setting.Select disabled key="selectDisabled">
        <option>Could not get audio output devices</option>
      </Setting.Select>
    );
  }

  return (
    <Setting.Select
      key="devicesOk" // avoid default value problems
      defaultValue={props.defaultValue}
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
