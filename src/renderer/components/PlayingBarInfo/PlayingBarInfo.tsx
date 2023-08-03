import * as utils from '../../lib/utils';
import { TrackModel, Repeat } from '../../../shared/types/museeks';
import TrackProgress from '../TrackProgress/TrackProgress';
import usePlayingTrackCurrentTime from '../../hooks/usePlayingTrackCurrentTime';

import styles from './PlayingBarInfo.module.css';

type Props = {
  trackPlaying: TrackModel;
  shuffle: boolean;
  repeat: Repeat;
};

export default function PlayingBarInfo(props: Props) {
  const { trackPlaying } = props;
  const elapsed = usePlayingTrackCurrentTime();

  return (
    <div className={styles.playingBar__info}>
      <div className={styles.playingBar__info__metas}>
        <div className={styles.duration}>{utils.parseDuration(elapsed)}</div>
        <div className={styles.metas}>
          <div className={`${styles.metadata} ${styles.metadataTitle}`}>
            <strong>{trackPlaying.title}</strong>
          </div>
          <div className={styles.metadata}>
            {trackPlaying.artist.join(', ')}
            &nbsp;—&nbsp;
            {trackPlaying.album}
          </div>
        </div>

        <div className={styles.duration}>
          {utils.parseDuration(trackPlaying.duration)}
        </div>
      </div>
      <TrackProgress trackPlaying={trackPlaying} />
    </div>
  );
}
