import { Slider } from 'radix-ui';
import { useCallback, useState } from 'react';

import type { Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import usePlayingTrackCurrentTime from '../hooks/usePlayingTrackCurrentTime';
import player from '../lib/player';
import styles from './TrackProgress.module.css';

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
  const trackDuration = trackPlaying.duration;

  const showTooltip = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const { offsetX } = e.nativeEvent;
      const barWidth = e.currentTarget.offsetWidth;

      const percent = (offsetX / barWidth) * 100;

      const time = (percent * trackDuration) / 100;

      setTooltipTargetTime(time);
      setTooltipX(percent);
    },
    [trackDuration],
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
      className={styles.trackRoot}
      onMouseMoveCapture={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <Slider.Track className={styles.trackProgress}>
        <Slider.Range className={styles.trackRange} />
        <div
          className={styles.progressTooltip}
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
