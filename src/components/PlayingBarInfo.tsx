import type { Repeat, Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import usePlayingTrackCurrentTime from '../hooks/usePlayingTrackCurrentTime';
import styles from './PlayingBarInfo.module.css';
import TrackProgress from './TrackProgress';

type Props = {
  trackPlaying: Track;
  shuffle: boolean;
  repeat: Repeat;
};

export default function PlayingBarInfo(props: Props) {
  const { trackPlaying } = props;
  const elapsed = usePlayingTrackCurrentTime();
  const formattedDuration = useFormattedDuration(trackPlaying.duration);
  const formattedProgress = useFormattedDuration(
    Math.min(trackPlaying.duration, elapsed),
  );

  return (
    <div className={styles.playingBarInfo} data-tauri-drag-region>
      <div className={styles.playingBarInfoMetas}>
        <div className={styles.duration}>{formattedProgress}</div>

        <div className={styles.metas}>
          <div className={`${styles.metadata} ${styles.metadataTitle}`}>
            <strong>{trackPlaying.title}</strong>
          </div>
          <div className={styles.metadata}>
            {trackPlaying.artists.join(', ')}
            &nbsp;—&nbsp;
            {trackPlaying.album}
          </div>
        </div>

        <div className={styles.duration}>{formattedDuration}</div>
      </div>
      <TrackProgress trackPlaying={trackPlaying} />
    </div>
  );
}
