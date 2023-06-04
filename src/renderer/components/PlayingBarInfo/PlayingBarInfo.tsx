import React, { useCallback, useEffect, useRef, useState } from 'react';

import ButtonShuffle from '../PlayerOptionsButtons/ButtonShuffle';
import ButtonRepeat from '../PlayerOptionsButtons/ButtonRepeat';
import * as utils from '../../lib/utils';
import { TrackModel, Repeat } from '../../../shared/types/museeks';
import usePlayerStore from '../../stores/usePlayerStore';

import styles from './PlayingBarInfo.module.css';

type Props = {
  trackPlaying: TrackModel;
  shuffle: boolean;
  repeat: Repeat;
};

export default function PlayingBarInfo(props: Props) {
  const { trackPlaying } = props;

  const playingBar = useRef<HTMLDivElement>(null);

  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [x, setX] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const jumpTo = usePlayerStore((state) => state.jumpTo);

  const tick = useCallback(() => {
    setElapsed(window.MuseeksAPI.player.getCurrentTime());
  }, []);

  const jumpAudioTo = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setDragging(true);

      if (playingBar.current) {
        const parent = playingBar.current.offsetParent as HTMLDivElement;
        const percent =
          ((e.pageX - (playingBar.current.offsetLeft + parent.offsetLeft)) / playingBar.current.offsetWidth) * 100;

        const to = (percent * trackPlaying.duration) / 100;

        jumpTo(to);
      }
    },
    [playingBar, trackPlaying, jumpTo]
  );

  const dragOver = useCallback(
    (e: MouseEvent) => {
      // Check if a currentTime update is needed
      if (dragging) {
        if (playingBar.current) {
          const playingBarRect = playingBar.current.getBoundingClientRect();

          const barWidth = playingBar.current.offsetWidth;
          const offsetX = Math.min(Math.max(0, e.pageX - playingBarRect.left), barWidth);

          const percent = (offsetX / barWidth) * 100;

          const to = (percent * trackPlaying.duration) / 100;

          jumpTo(to);
        }
      }
    },
    [playingBar, dragging, trackPlaying, jumpTo]
  );

  const dragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const showTooltip = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { offsetX } = e.nativeEvent;
      const barWidth = e.currentTarget.offsetWidth;

      const percent = (offsetX / barWidth) * 100;

      const time = (percent * trackPlaying.duration) / 100;

      setDuration(time);
      setX(percent);
    },
    [trackPlaying]
  );

  const hideTooltip = useCallback(() => {
    setDuration(null);
    setX(null);
  }, []);

  useEffect(() => {
    window.MuseeksAPI.player.getAudio().addEventListener('timeupdate', tick);

    window.addEventListener('mousemove', dragOver);
    window.addEventListener('mouseup', dragEnd);

    return () => {
      window.MuseeksAPI.player.getAudio().removeEventListener('timeupdate', tick);

      window.removeEventListener('mousemove', dragOver);
      window.removeEventListener('mouseup', dragEnd);
    };
  }, [dragEnd, dragOver, tick]);

  return (
    <div className={styles.playingBar__info}>
      <div className={styles.playingBar__info__metas}>
        <div className={styles.playerOptions}>
          <ButtonRepeat />
          <ButtonShuffle />
        </div>
        <div className={styles.metas}>
          <strong>{trackPlaying.title}</strong>
          &nbsp;by&nbsp;
          <strong>{trackPlaying.artist.join(', ')}</strong>
          &nbsp;on&nbsp;
          <strong>{trackPlaying.album}</strong>
        </div>

        <div className={styles.duration}>
          {utils.parseDuration(elapsed)} / {utils.parseDuration(trackPlaying.duration)}
        </div>
      </div>
      <div className={styles.playingBar__info__progress} ref={playingBar}>
        <div className={styles.progressTooltip} hidden={duration === null} style={{ left: `${x}%` }}>
          {utils.parseDuration(duration)}
        </div>
        <div
          className={styles.progress}
          role='progressbar'
          tabIndex={0}
          onMouseDown={jumpAudioTo}
          onMouseMove={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <div
            className={styles.progressBar}
            style={
              elapsed / trackPlaying.duration <= 1
                ? { transform: `scale3d(${elapsed / trackPlaying.duration}, 1, 1)` }
                : { display: 'none' }
            }
          />
        </div>
      </div>
    </div>
  );
}
