import React, { useCallback, useState } from 'react';
import Icon from 'react-fontawesome';
import cx from 'classnames';
import Slider from 'react-rangeslider';

import controlStyles from '../PlayerControls/PlayerControls.module.css';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './VolumeControl.module.css';

// Volume easing - http://www.dr-lex.be/info-stuff/volumecontrols.html#about
const SMOOTHING_FACTOR = 2.5;

const smoothifyVolume = (value: number): number => value ** SMOOTHING_FACTOR;
const unsmoothifyVolume = (value: number): number => value ** (1 / SMOOTHING_FACTOR);

const getVolumeIcon = (volume: number, muted: boolean): string => {
  if (muted || volume === 0) return 'volume-off';
  if (volume < 0.5) return 'volume-down';
  return 'volume-up';
};

export default function VolumeControl() {
  const audio = window.MuseeksAPI.player.getAudio();

  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(audio.volume);
  const [muted, setMuted] = useState(audio.muted);

  const playerState = usePlayerStore((state) => ({
    setVolume: state.setVolume,
    setMuted: state.setMuted,
  }));

  const setPlayerVolume = useCallback(
    (value: number) => {
      const smoothVolume = smoothifyVolume(value);

      playerState.setVolume(smoothVolume);
      setVolume(smoothVolume);
    },
    [setVolume, playerState]
  );

  const mute = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.currentTarget.classList.contains(controlStyles.control) || e.currentTarget.classList.contains('fa')) {
        const muted = !window.MuseeksAPI.player.isMuted();

        playerState.setMuted(muted);
        setMuted(muted);
      }
    },
    [playerState]
  );

  const volumeClasses = cx(styles.volumeControl, {
    [styles.visible]: showVolume,
  });

  return (
    <div
      className={styles.volumeControlContainer}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <button type='button' className={controlStyles.control} title='Volume' onClick={mute}>
        <Icon name={getVolumeIcon(unsmoothifyVolume(volume), muted)} />
      </button>
      <div className={volumeClasses}>
        <Slider
          min={0}
          max={1}
          step={0.01}
          tooltip={false}
          value={unsmoothifyVolume(volume)}
          onChange={setPlayerVolume}
        />
      </div>
    </div>
  );
}
