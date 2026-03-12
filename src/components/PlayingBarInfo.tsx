import * as stylex from '@stylexjs/stylex';

import Link from '../elements/Link';
import type { Repeat, Track } from '../generated/typings';
import useFormattedDuration from '../hooks/useFormattedDuration';
import usePlayingTrackCurrentTime from '../hooks/usePlayingTrackCurrentTime';
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
    <div {...stylex.props(styles.playingBarInfo)} data-tauri-drag-region>
      <div {...stylex.props(styles.playingBarInfoMetas)}>
        <div {...stylex.props(styles.duration)}>{formattedProgress}</div>

        <div {...stylex.props(styles.metas)}>
          <div
            {...stylex.props(styles.metadata, styles.metadataTitle)}
            data-testid="playing-track-title"
          >
            <strong>{trackPlaying.title}</strong>
          </div>
          <div
            {...stylex.props(styles.metadata)}
            data-testid="playing-track-artist-album"
          >
            <Link
              inheritColor
              type="normal"
              linkOptions={
                trackPlaying.is_compilation
                  ? {
                      to: '/artists/presets/compilations',
                      search: { focused_album: trackPlaying.album },
                    }
                  : {
                      to: '/artists/$artistID',
                      params: { artistID: trackPlaying.album_artist },
                    }
              }
            >
              {trackPlaying.artists.join(', ')}
            </Link>
            &nbsp;—&nbsp;
            <Link
              inheritColor
              type="normal"
              linkOptions={
                trackPlaying.is_compilation
                  ? {
                      to: '/artists/presets/compilations',
                      search: { focused_album: trackPlaying.album },
                    }
                  : {
                      to: '/artists/$artistID',
                      params: { artistID: trackPlaying.album_artist },
                      search: { focused_album: trackPlaying.album },
                    }
              }
            >
              {trackPlaying.album}
            </Link>
          </div>
        </div>

        <div {...stylex.props(styles.duration)}>{formattedDuration}</div>
      </div>
      <TrackProgress trackPlaying={trackPlaying} />
    </div>
  );
}

const styles = stylex.create({
  playingBarInfo: {
    flex: '1 1 auto',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  playingBarInfoMetas: {
    gap: '4px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  metas: {
    flex: '1 1 auto',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'middle',
    textAlign: 'center',
  },
  metadataTitle: {
    marginBottom: '2px',
  },
  metadata: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  duration: {
    flex: '0 0 auto',
    fontSize: '0.875rem',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: '2px',
    paddingRight: '2px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    opacity: 0.7,
  },
});
