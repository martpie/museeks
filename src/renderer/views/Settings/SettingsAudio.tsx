import React, { useCallback } from 'react';

import * as Setting from '../../components/Setting/Setting';
import AudioOutputSelect from '../../components/AudioOutputSelect/AudioOutputSelect';
import * as PlayerActions from '../../store/actions/PlayerActions';
import { Config } from '../../../shared/types/museeks';

export default function SettingsAudio() {
  const setPlaybackRate = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
    PlayerActions.setPlaybackRate(parseFloat(e.currentTarget.value));
  }, []);

  const setOutputDevice = useCallback((deviceId: string) => {
    PlayerActions.setOutputDevice(deviceId);
  }, []);

  const config = window.MuseeksAPI.config.get() as Config;

  return (
    <div className='setting setting-audio'>
      <Setting.Section>
        <Setting.Label htmlFor='setting-playbackrate'>Playback rate</Setting.Label>
        <Setting.Input
          id='setting-playbackrate'
          defaultValue={`${config.audioPlaybackRate}`}
          onChange={setPlaybackRate}
          type='number'
          min='0.5'
          max='5'
          step='0.1'
        />
        <Setting.Description>
          Increase the playback rate: a value of 2 will play your music at a 2x speed
        </Setting.Description>
      </Setting.Section>
      <Setting.Section>
        <Setting.Label htmlFor='setting-playbackrate'>Audio output</Setting.Label>
        <AudioOutputSelect defaultValue={config.audioOutputDevice} onChange={setOutputDevice} />
        <Setting.Description>Advanced: set a custom audio output device.</Setting.Description>
      </Setting.Section>
    </div>
  );
}
