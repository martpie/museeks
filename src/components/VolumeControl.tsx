import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { HoverCard, Slider } from 'radix-ui';
import { useCallback } from 'react';

import ButtonIcon from '../elements/ButtonIcon';
import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import { stopPropagation } from '../lib/utils-events';
import type { IconName } from './Icon';

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
  const { t } = useLingui();

  const setPlayerVolume = useCallback((values: number[]) => {
    const [value] = values;
    const smoothVolume = smoothifyVolume(value);
    player.setVolume(smoothVolume); // Debounced save happens in player
  }, []);

  return (
    <HoverCard.Root openDelay={0} closeDelay={150}>
      <HoverCard.Trigger asChild>
        <div sx={styles.volumeControlContainer}>
          <ButtonIcon
            title={t`Volume`}
            onClick={() => player.toggleMute()}
            icon={getVolumeIcon(unsmoothifyVolume(volume), muted)}
            iconSize={16}
          />
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content
        side="right"
        sideOffset={8}
        sx={styles.volumeHoverCard}
      >
        <Slider.Root
          value={[unsmoothifyVolume(volume)]}
          onKeyDown={stopPropagation}
          onValueChange={setPlayerVolume}
          min={0}
          max={1}
          step={0.01}
          sx={[styles.sliderRoot, muted && styles.faded]}
        >
          <Slider.Track sx={styles.sliderTrack}>
            <Slider.Range sx={styles.sliderRange} />
          </Slider.Track>
          <Slider.Thumb
            aria-label={t`Volume`}
            data-museeks-action
            sx={styles.sliderThumb}
          />
        </Slider.Root>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const fadeOut = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const styles = stylex.create({
  volumeControlContainer: {
    position: 'relative',
    marginLeft: '4px',
    paddingBlock: '0',
    paddingInline: '4px',
    lineHeight: 1,
  },
  volumeHoverCard: {
    backgroundColor: 'var(--header-bg)',
    paddingBlock: '10px',
    paddingInline: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    zIndex: 1,
    animationDuration: '150ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
    animationName: {
      ':is([data-state="open"])': fadeIn,
      ':is([data-state="closed"])': fadeOut,
    },
  },
  sliderRoot: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    touchAction: 'none',
    width: '90px',
    height: '10px',
    borderRadius: 'var(--border-radius)',
  },
  sliderTrack: {
    backgroundColor: 'var(--slider-bg)',
    position: 'relative',
    flexGrow: 1,
    borderRadius: '9999px',
    height: '4px',
  },
  sliderRange: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'var(--main-color)',
    borderRadius: 'var(--border-radius)',
  },
  sliderThumb: {
    display: 'block',
    width: '10px',
    height: '10px',
    backgroundColor: 'white',
    borderRadius: '50%',
    outline: {
      ':active': 'none',
    },
    boxShadow: {
      default: '0 0 0 1px var(--border-color)',
      ':active': '0 0 0 2px var(--main-color)',
    },
  },
  faded: {
    opacity: 0.6,
  },
});
