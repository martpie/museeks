import { useLingui } from '@lingui/react/macro';
import cx from 'classnames';
import { Slider } from 'radix-ui';
import { useCallback, useState } from 'react';

import ButtonIcon from '../elements/ButtonIcon';
import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import { stopPropagation } from '../lib/utils-events';
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
  const volume = usePlayerState((state) => state.volume);
  const muted = usePlayerState((state) => state.muted);
  const [showVolume, setShowVolume] = useState(false);
  const { t } = useLingui();

  const setPlayerVolume = useCallback((values: number[]) => {
    const [value] = values;
    const smoothVolume = smoothifyVolume(value);
    player.setVolume(smoothVolume); // Debounced save happens in player
  }, []);

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
        onClick={player.toggleMute}
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
