import * as stylex from '@stylexjs/stylex';
import { Slider } from 'radix-ui';
import { useCallback, useState } from 'react';

import type { Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import usePlayingTrackCurrentTime from '../hooks/usePlayingTrackCurrentTime';
import player from '../lib/player';

type Props = {
  trackPlaying: Track;
};

export default function TrackProgress(props: Props) {
  const { trackPlaying } = props;

  const elapsed = usePlayingTrackCurrentTime();

  const jumpAudioTo = useCallback((values: number[]) => {
    const [to] = values;
    player.setCurrentTime(to);
  }, []);

  const [tooltipTargetTime, setTooltipTargetTime] = useState<null | number>(
    null,
  );
  const [tooltipX, setTooltipX] = useState<null | number>(null);

  const showTooltip = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { offsetX } = e.nativeEvent;
      const barWidth = e.currentTarget.offsetWidth;

      const percent = (offsetX / barWidth) * 100;

      const time = (percent * trackPlaying.duration) / 100;

      setTooltipTargetTime(time);
      setTooltipX(percent);
    },
    [trackPlaying],
  );

  const hideTooltip = useCallback(() => {
    setTooltipTargetTime(null);
    setTooltipX(null);
  }, []);

  const tooltipContent = useFormattedDuration(tooltipTargetTime);

  return (
    <Slider.Root
      min={0}
      max={trackPlaying.duration}
      step={1}
      value={[elapsed]}
      onValueChange={jumpAudioTo}
      sx={styles.trackRoot}
      onMouseMoveCapture={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <Slider.Track sx={styles.trackProgress}>
        <Slider.Range sx={styles.trackRange} />
        <div
          sx={styles.progressTooltip}
          style={{
            left: `${tooltipX}%`,
            display: tooltipX == null ? 'none' : 'block',
          }}
        >
          {tooltipContent}
        </div>
      </Slider.Track>
      <Slider.Thumb />
    </Slider.Root>
  );
}

const styles = stylex.create({
  trackRoot: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    userSelect: 'none',
    touchAction: 'none',
    height: '7px',
    transform: 'translateY(4px)',
  },
  trackProgress: {
    display: 'block',
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--header-bg)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
  },
  trackRange: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'var(--main-color)',
    boxShadow: 'inset 0 0 0 1px rgba(0 0 0 / 0.2)',
  },
  progressTooltip: {
    position: 'absolute',
    backgroundColor: 'var(--background)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    fontSize: '10px',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '5px',
    paddingRight: '5px',
    bottom: '10px',
    zIndex: 1,
    transform: 'translateX(-11px)',
    pointerEvents: 'none',
    '::before': {
      content: '""',
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderBottomWidth: 0,
      top: '16px',
      left: '5px',
      borderTopColor: 'var(--border-color)',
      borderWidth: '6px',
    },
    '::after': {
      content: '""',
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
      borderBottomWidth: 0,
      top: '15px',
      left: '6px',
      borderTopColor: 'var(--background)',
      borderWidth: '5px',
    },
  },
});
