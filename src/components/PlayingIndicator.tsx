import * as stylex from '@stylexjs/stylex';
import { useMemo, useState } from 'react';

import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import Icon from './Icon';

type Props = {
  size?: 'default' | 'large';
};

export default function TrackPlayingIndicator({ size = 'default' }: Props) {
  const [hovered, setHovered] = useState(false);
  const isPaused = usePlayerState((state) => state.isPaused);
  const isLarge = size === 'large';

  const icon = useMemo(() => {
    if (!isPaused) {
      if (hovered) {
        return <Icon name="pause" size={isLarge ? 16 : 12} />;
      }

      return (
        <div
          {...stylex.props(styles.animation, isLarge && styles.animationLarge)}
        >
          <div {...stylex.props(styles.bar, isLarge && styles.barLarge)} />
          <div
            {...stylex.props(
              styles.bar,
              isLarge && styles.barLarge,
              styles.barSecond,
            )}
          />
          <div
            {...stylex.props(
              styles.bar,
              isLarge && styles.barLarge,
              styles.barThird,
            )}
          />
        </div>
      );
    }

    return <Icon name="play" size={isLarge ? 16 : undefined} />;
  }, [isPaused, hovered, isLarge]);

  return (
    <button
      type="button"
      onClick={() => player.playPause()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      data-museeks-action
      {...stylex.props(styles.playingIndicator)}
    >
      {icon}
    </button>
  );
}

const barAnimation = stylex.keyframes({
  '0%': { transform: 'scale3d(1, 0, 1)' },
  '50%': { transform: 'scale3d(1, 1, 1)' },
  '100%': { transform: 'scale3d(1, 0, 1)' },
});

const styles = stylex.create({
  playingIndicator: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    padding: 0,
  },
  animation: {
    width: '8px',
    height: '8px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  animationLarge: {
    width: '16px',
    height: '18px',
  },
  bar: {
    height: '8px',
    width: '2px',
    alignItems: 'baseline',
    backgroundColor: 'currentcolor',
    animationName: barAnimation,
    animationDuration: '1s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    transformOrigin: 'bottom',
  },
  barLarge: {
    height: '18px',
    width: '4px',
  },
  barSecond: {
    animationDelay: '0.55s',
  },
  barThird: {
    animationDelay: '0.25s',
  },
});
