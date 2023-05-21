import React, { useEffect, useState } from 'react';

import logger from '../../../shared/lib/logger';
import * as Setting from '../Setting/Setting';

interface Props {
  defaultValue: string;
  onChange: (deviceId: string) => void;
}

function AudioOutputSelect(props: Props) {
  const [devices, setDevices] = useState<MediaDeviceInfo[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const refreshDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        setDevices(devices.filter((device) => device.kind === 'audiooutput'));
      } catch (err) {
        setDevices([]);
        setHasError(true);
        logger.warn(err);
      }
    };

    refreshDevices();
  }, []);

  const setAudioOutputDevice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    props.onChange(e.currentTarget.value);
  };

  if (!devices) {
    return (
      <select disabled key='selectDisabled'>
        <option>loading devices...</option>
      </select>
    );
  }

  if (hasError) {
    return (
      <select disabled key='selectDisabled'>
        <option>Could not get audio output devices</option>
      </select>
    );
  }

  return (
    <Setting.Select
      key='devicesOk' // avoid default value problems
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

export default AudioOutputSelect;
