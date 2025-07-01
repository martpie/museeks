import { useLingui } from '@lingui/react/macro';
import * as Slider from '@radix-ui/react-slider';
import cx from 'classnames';
import { useCallback, useState } from 'react';

import ButtonIcon from '../elements/ButtonIcon';
import player from '../lib/player';
import { stopPropagation } from '../lib/utils-events';
import { usePlayerAPI } from '../stores/usePlayerStore';
import type { IconName } from './Icon';
import styles from './VolumeControl.module.css';

// Volume easing - http://www.dr-lex.be/info-stuff/volumecontrols.html#about
const SMOOTHING_FACTOR = 2.5;

const smoothifyVolume = (value: number): number => value ** SMOOTHING_FACTOR;
const unsmoothifyVolume = (value: number): number =>
  value ** (1.0 / SMOOTHING_FACTOR);

const getVolumeIcon = (volume: number, muted: boolean): IconName => {
  if (muted) return 'volumeMute';
  if (volume === 0) return 'volumeOff';
  if (volume < 0.33) return 'volumeLow';
  if (volume < 0.67) return 'volumeMedium';
  return 'volumeHigh';
};

export default function VolumeControl() {
  const audio = player.getAudio();

  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(audio.volume);
  const [muted, setMuted] = useState(audio.muted);
  const { t } = useLingui();

  const playerAPI = usePlayerAPI();

  const setPlayerVolume = useCallback(
    (values: number[]) => {
      const [value] = values;
      const smoothVolume = smoothifyVolume(value);

      playerAPI.setVolume(smoothVolume);
      setVolume(smoothVolume);
    },
    [playerAPI],
  );

  // TODO: move to player actions
  const mute = useCallback(() => {
    const muted = !player.isMuted();

    playerAPI.setMuted(muted);
    setMuted(muted);
  }, [playerAPI]);

  const volumeClasses = cx(styles.volumeControl, {
    [styles.visible]: showVolume,
  });

  const sliderClasses = cx(styles.sliderRoot, {
    [styles.faded]: muted,
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: will fix one day and make it interactive
    <div
      className={styles.volumeControlContainer}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <ButtonIcon
        title={t`Volume`}
        onClick={mute}
        icon={getVolumeIcon(unsmoothifyVolume(volume), muted)}
        iconSize={16}
      />
      <div className={volumeClasses}>
        <Slider.Root
          className={sliderClasses}
          value={[unsmoothifyVolume(volume)]}
          onKeyDown={stopPropagation}
          onValueChange={setPlayerVolume}
          min={0}
          max={1}
          step={0.01}
        >
          <Slider.Track className={styles.sliderTrack}>
            <Slider.Range className={styles.sliderRange} />
          </Slider.Track>
          <Slider.Thumb
            className={styles.sliderThumb}
            aria-label={t`Volume`}
            data-museeks-action
          />
        </Slider.Root>
      </div>
    </div>
  );
}
