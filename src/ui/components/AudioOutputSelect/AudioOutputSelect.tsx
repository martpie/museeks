import * as React from 'react';

import * as Setting from '../Setting/Setting';

type Props = {
  defaultValue: string;
  onChange: (deviceId: string) => void;
};

type State = {
  devices: MediaDeviceInfo[] | null;
  hasError: boolean;
};

class AudioOutputSelect extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);

    this.state = {
      devices: null,
      hasError: false
    };
  }

  async componentDidMount () {
    await this.updateDevices();
  }

  updateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      this.setState({
        devices: devices.filter(device => device.kind === 'audiooutput')
      });
    } catch (err) {
      this.setState({
        hasError: true,
        devices: []
      });
      console.warn(err);
    }
  }

  setAudioOutputDevice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onChange(e.currentTarget.value);
  }

  render () {
    const { devices, hasError } = this.state;

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
        defaultValue={this.props.defaultValue}
        onChange={this.setAudioOutputDevice}
      >
        {devices.map(device => {
          return (
            <option
              key={device.deviceId}
              value={device.deviceId}
            >{device.label}</option>
          );
        })}
      </Setting.Select>
    );
  }
}

export default AudioOutputSelect;
