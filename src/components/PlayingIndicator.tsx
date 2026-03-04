import * as stylex from '@stylexjs/stylex';
import { useEffect, useMemo, useState } from 'react';

import { usePlayerState } from '../hooks/usePlayer';
import player from '../lib/player';
import Icon from './Icon';

const BAR_FRAMES = [
  [0.15, 1, 0.45],
  [0.7, 0.25, 1],
  [1, 0.8, 0.2],
  [0.35, 1, 0.65],
  [1, 0.4, 0.9],
  [0.2, 0.95, 0.5],
] as const;

export default function TrackPlayingIndicator() {
  const [hovered, setHovered] = useState(false);
  const [step, setStep] = useState(0);
  const isPaused = usePlayerState((state) => state.isPaused);

  useEffect(() => {
    if (isPaused || hovered) {
      return;
    }

    const id = setInterval(() => {
      setStep((current) => (current + 1) % BAR_FRAMES.length);
    }, 180);

    return () => clearInterval(id);
  }, [hovered, isPaused]);

  const icon = useMemo(() => {
    if (!isPaused) {
      if (hovered) {
        return <Icon name="pause" size={12} />;
      }

      const [barOneScale, barTwoScale, barThreeScale] = BAR_FRAMES[step];

      return (
        <div {...stylex.props(styles.animation)}>
          <div
            {...stylex.props(styles.bar, styles.barSpaced)}
            style={{ transform: `scale3d(1, ${barOneScale}, 1)` }}
          />
          <div
            {...stylex.props(styles.bar, styles.barSpaced)}
            style={{ transform: `scale3d(1, ${barTwoScale}, 1)` }}
          />
          <div
            {...stylex.props(styles.bar)}
            style={{ transform: `scale3d(1, ${barThreeScale}, 1)` }}
          />
        </div>
      );
    }

    return <Icon name="play" />;
  }, [isPaused, hovered, step]);

  return (
    <button
      type="button"
      {...stylex.props(styles.playingIndicator)}
      onClick={() => player.playPause()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      data-museeks-action
    >
      {icon}
    </button>
  );
}

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
    transformOrigin: 'bottom',
    transition: 'transform 180ms ease-in-out',
  },
  barSpaced: {
    marginRight: '1px',
  },
});
