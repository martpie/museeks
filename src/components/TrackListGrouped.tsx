import { Plural, useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { useImperativeHandle, useRef } from 'react';

import Scrollable from '../elements/Scrollable';
import type { TrackGroup } from '../generated/typings';
import useAllTracks from '../hooks/useAllTracks';
import { parseDuration } from '../hooks/useFormattedDuration';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import type { TrackListVirtualizer } from '../types/museeks';
import Cover from './Cover';
import TrackRow, { type TrackRowEvents } from './TrackRow';

/** ----------------------------------------------------------------------------
 * Group-based layout for TrackList:
 *  - Does NOT use a virtual list (but it should)
 *  - Non-reorderable
 * -------------------------------------------------------------------------- */

type Props = {
  ref: React.RefObject<TrackListVirtualizer | null>;
  trackGroups: TrackGroup[];
  selectedTracks: Set<string>;
  initialOffset: number;
  rowHeight: number;
  showArtistInTitle?: boolean;
  showArtistLabel?: boolean;
} & TrackRowEvents;

export default function TrackListGroupedLayout(props: Props) {
  const {
    ref,
    trackGroups,
    rowHeight,
    showArtistInTitle,
    showArtistLabel,
    ...rest
  } = props;
  const { t } = useLingui();

  const tracks = useAllTracks(trackGroups);

  const innerScrollableRef = useRef<HTMLDivElement>(null);

  // Passes the ref back to the master component for interaction with the
  // scrollable view
  useImperativeHandle(ref, () => {
    return {
      scrollElement: innerScrollableRef.current,
      scrollToIndex: (index: number) => {
        if (innerScrollableRef.current) {
          const track = tracks[index];
          // not super idiomatic, but works eh
          document
            .querySelector(`[data-track-id="${track.id}"]`)
            ?.scrollIntoView({ block: 'nearest' });
        }
      },
    } satisfies TrackListVirtualizer;
  }, [tracks]);

  return (
    <Scrollable
      ref={innerScrollableRef}
      role="listbox"
      aria-label={t`Track list`}
      aria-multiselectable="true"
    >
      {trackGroups.map((tracksGroup) => {
        return (
          <TrackListGroup
            // Label should be unique due to how the tracks are grouped from get_artist_tracks()
            key={tracksGroup.label}
            tracksGroup={tracksGroup}
            rowHeight={rowHeight}
            showArtistInTitle={showArtistInTitle}
            showArtistLabel={showArtistLabel}
            {...rest}
          />
        );
      })}
    </Scrollable>
  );
}

type TrackListGroupProps = {
  tracksGroup: TrackGroup;
  selectedTracks: Set<string>;
  rowHeight: number;
  showArtistInTitle?: boolean;
  showArtistLabel?: boolean;
} & TrackRowEvents;

function TrackListGroup(props: TrackListGroupProps) {
  const {
    selectedTracks,
    rowHeight,
    showArtistInTitle,
    showArtistLabel,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;
  const { tracks, label, year, genres, duration } = props.tracksGroup;
  const trackPlayingID = usePlayingTrackID();

  if (tracks.length === 0) {
    return null;
  }

  const artistName = showArtistLabel
    ? tracks[0]?.album_artist || tracks[0]?.artists[0] || null
    : null;

  return (
    <div
      {...stylex.props(styles.group)}
      data-track-group={encodeURIComponent(label)}
    >
      <aside {...stylex.props(styles.aside)}>
        {/** Instead of the first one, maybe get the first track within the album to hold a cover? */}
        <Cover track={tracks[0]} iconSize={36} />
        <h3 {...stylex.props(styles.label)}>{label}</h3>
        {artistName && <p {...stylex.props(styles.artist)}>{artistName}</p>}
        <div {...stylex.props(styles.metadata)}>
          <div>
            {year}
            {genres.length > 0 && <span> - {genres.join(', ')}</span>}
          </div>
          <div>
            <Plural value={tracks.length} one="# track" other="# tracks" />,{' '}
            {parseDuration(duration)}
          </div>
        </div>
      </aside>
      <ul {...stylex.props(styles.rows)}>
        {tracks.map((track, index) => {
          return (
            <TrackRow
              key={track.id}
              selected={selectedTracks.has(track.id)}
              track={track}
              isPlaying={trackPlayingID === track.id}
              index={index}
              onTrackSelect={onTrackSelect}
              onContextMenu={onContextMenu}
              onPlaybackStart={onPlaybackStart}
              draggable={false}
              hasSelectedAbove={
                index > 0 && selectedTracks.has(tracks[index - 1].id)
              }
              simplified={true}
              showArtistInTitle={showArtistInTitle}
              style={{ height: `${rowHeight}px` }} // Figure out virtualization for grouped stuff
            />
          );
        })}
      </ul>
    </div>
  );
}

const styles = stylex.create({
  group: {
    display: 'flex',
    gap: '24px',
    padding: '24px',
    alignItems: 'flex-start',
    position: 'relative',
  },
  aside: {
    width: {
      default: '160px',
      '@media (min-width: 1024px)': '240px',
    },
    position: 'sticky',
    top: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0,
  },
  label: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    margin: 0,
  },
  artist: {
    color: 'var(--text-muted)',
    margin: 0,
    fontSize: '0.95rem',
  },
  metadata: {
    color: 'var(--text-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  rows: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: 0,
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
});
