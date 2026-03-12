import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import Icon from './Icon';

export default function TrackPlayingIndicator() {
  const [hovered, setHovered] = useState(false);
  const isPaused = usePlayerState((state) => state.isPaused);

  const icon = isPaused ? (
    <Icon name="play" />
  ) : hovered ? (
    <Icon name="pause" size={12} />
  ) : (
    <div {...stylex.props(styles.animation)}>
      <div {...stylex.props(styles.bar)} />
      <div {...stylex.props(styles.bar, styles.barSecond)} />
      <div {...stylex.props(styles.bar, styles.barThird)} />
    </div>
  );

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
  barSecond: {
    animationDelay: '0.55s',
  },
  barThird: {
    animationDelay: '0.25s',
  },
});
