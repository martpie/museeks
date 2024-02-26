import * as utils from '../../lib/utils';
import TrackProgress from '../TrackProgress/TrackProgress';
import usePlayingTrackCurrentTime from '../../hooks/usePlayingTrackCurrentTime';
import { TrackDoc, Repeat } from '../../generated/typings';

import styles from './PlayingBarInfo.module.css';

type Props = {
  trackPlaying: TrackDoc;
  shuffle: boolean;
  repeat: Repeat;
};

export default function PlayingBarInfo(props: Props) {
  const { trackPlaying } = props;
  const elapsed = usePlayingTrackCurrentTime();

  return (
    <div className={styles.playingBar__info} data-tauri-drag-region>
      <div className={styles.playingBar__info__metas}>
        <div className={styles.duration}>{utils.parseDuration(elapsed)}</div>

        <div className={styles.metas}>
          <div className={`${styles.metadata} ${styles.metadataTitle}`}>
            <strong>{trackPlaying.doc.title}</strong>
          </div>
          <div className={styles.metadata}>
            {trackPlaying.doc.artists.join(', ')}
            &nbsp;—&nbsp;
            {trackPlaying.doc.album}
          </div>
        </div>

        <div className={styles.duration}>
          {utils.parseDuration(trackPlaying.doc.duration)}
        </div>
      </div>
      <TrackProgress trackPlaying={trackPlaying} />
    </div>
  );
}
