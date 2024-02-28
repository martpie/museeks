import { useCallback, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';

import { usePlayerAPI } from '../../stores/usePlayerStore';
import { TrackDoc } from '../../generated/typings';
import usePlayingTrackCurrentTime from '../../hooks/usePlayingTrackCurrentTime';
import { parseDuration } from '../../lib/utils';

import styles from './TrackProgress.module.css';

type Props = {
  trackPlaying: TrackDoc;
};

export default function TrackProgress(props: Props) {
  const { trackPlaying } = props;

  const elapsed = usePlayingTrackCurrentTime();
  const playerAPI = usePlayerAPI();

  const jumpAudioTo = useCallback(
    (values: number[]) => {
      const [to] = values;

      playerAPI.jumpTo(to);
    },
    [playerAPI],
  );

  const [tooltipTargetTime, setTooltipTargetTime] = useState<null | number>(
    null,
  );
  const [tooltipX, setTooltipX] = useState<null | number>(null);

  const showTooltip = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // TODO FIXME: wrong when hovering the border, maybe due to border-box?
      // console.log(e.target);
      // console.log(e.currentTarget);
      // console.log('=============');
      // sometimes on track_+progress
      // sometimes even triggered on tooltip ---> WTF

      const { offsetX } = e.nativeEvent;
      const barWidth = e.currentTarget.offsetWidth;

      const percent = (offsetX / barWidth) * 100;

      const time = (percent * trackPlaying.doc.duration) / 100;

      setTooltipTargetTime(time);
      setTooltipX(percent);
    },
    [trackPlaying],
  );

  const hideTooltip = useCallback(() => {
    setTooltipTargetTime(null);
    setTooltipX(null);
  }, []);

  return (
    <Slider.Root
      min={0}
      max={trackPlaying.doc.duration}
      step={1}
      value={[elapsed]}
      onValueChange={jumpAudioTo}
      className={styles.trackRoot}
      onMouseMove={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <Slider.Track className={styles.trackProgress}>
        <Slider.Range className={styles.trackRange} />
        {tooltipX !== null && (
          <div
            className={styles.progressTooltip}
            style={{ left: `${tooltipX}%` }}
          >
            {parseDuration(tooltipTargetTime)}
          </div>
        )}
      </Slider.Track>
      <Slider.Thumb />
    </Slider.Root>
  );
}
