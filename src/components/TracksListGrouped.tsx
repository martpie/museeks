import { useImperativeHandle, useMemo, useRef } from 'react';

import type { TrackGroup } from '../generated/typings';
import useAllTracks from '../hooks/useAllTracks';
import { parseDuration } from '../hooks/useFormattedDuration';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import { plural } from '../lib/localization';
import type { TracksListVirtualizer } from '../types/museeks';
import Cover from './Cover';
import TrackRow, { type TrackRowEvents } from './TrackRow';
import styles from './TracksList.module.css';

/** ----------------------------------------------------------------------------
 * Group-based layout for TracksList:
 *  - Uses a Virtual List
 *  - Non-reorderable
 * -------------------------------------------------------------------------- */

type Props = {
  ref: React.RefObject<TracksListVirtualizer | null>;
  trackGroups: TrackGroup[];
  selectedTracks: Set<string>;
  initialOffset: number;
  rowHeight: number;
} & TrackRowEvents;

export default function TrackListGroupedLayout(props: Props) {
  const { ref, trackGroups, initialOffset, rowHeight, ...rest } = props;
  const tracks = useAllTracks(trackGroups);

  const innerScrollableRef = useRef<HTMLDivElement>(null);

  // Passes the ref back to the master component for interaction with the
  // scrollable view
  useImperativeHandle(
    ref,
    () => {
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
      } satisfies TracksListVirtualizer;
    },
    [tracks],
  );

  return (
    <div ref={innerScrollableRef} className={styles.tracksListScroller}>
      {trackGroups.map((tracksGroup) => {
        return (
          <TrackListGroup
            // Label should be unique due to how the tracks are grouped from get_artist_tracks()
            key={tracksGroup.label}
            tracksGroup={tracksGroup}
            rowHeight={rowHeight}
            {...rest}
          />
        );
      })}
    </div>
  );
}

type TracksListGroupProps = {
  tracksGroup: TrackGroup;
  selectedTracks: Set<string>;
  rowHeight: number;
} & TrackRowEvents;

function TrackListGroup(props: TracksListGroupProps) {
  const {
    selectedTracks,
    rowHeight,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;
  const { tracks, label } = props.tracksGroup;

  const trackPlayingID = usePlayingTrackID();

  const genres = useMemo(() => {
    const aggregator = new Set<string>();
    tracks.forEach((track) => {
      track.genres.forEach(aggregator.add, aggregator);
    });
    return Array.from(aggregator);
  }, [tracks]);

  const duration = useMemo(() => {
    return tracks.reduce((sum, track) => sum + track.duration, 0);
  }, [tracks]);

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className={styles.tracksGroup}>
      <div className={styles.tracksGroupMetadata}>
        {/** Instead of the first one, maybe get the first track within the album to hold a cover? */}
        <Cover track={tracks[0]} noteSize={5} noBorder />
        <h3 className={styles.tracksGroupLabel}>{label}</h3>
        <div className={styles.tracksGroupGenres}>
          {tracks.length} {plural('track', tracks.length)},{' '}
          {parseDuration(duration)}
        </div>
        <div className={styles.tracksGroupGenres}>{genres.join(', ')}</div>
      </div>
      <div className={styles.tracksGroupContent}>
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
              simplified={true}
              style={{ height: `${rowHeight}px` }} // Figure out virtualization for grouped stuff
            />
          );
        })}
      </div>
    </div>
  );
}
