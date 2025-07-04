import { Plural } from '@lingui/react/macro';
import { useImperativeHandle, useRef } from 'react';

import Scrollable from '../elements/Scrollable';
import type { TrackGroup } from '../generated/typings';
import useAllTracks from '../hooks/useAllTracks';
import { parseDuration } from '../hooks/useFormattedDuration';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import type { TrackListVirtualizer } from '../types/museeks';
import Cover from './Cover';
import styles from './TrackListGrouped.module.css';
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
} & TrackRowEvents;

export default function TrackListGroupedLayout(props: Props) {
  const { ref, trackGroups, rowHeight, ...rest } = props;
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
    <Scrollable ref={innerScrollableRef}>
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
    </Scrollable>
  );
}

type TrackListGroupProps = {
  tracksGroup: TrackGroup;
  selectedTracks: Set<string>;
  rowHeight: number;
} & TrackRowEvents;

function TrackListGroup(props: TrackListGroupProps) {
  const {
    selectedTracks,
    rowHeight,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;
  const { tracks, label, year, genres, duration } = props.tracksGroup;

  const trackPlayingID = usePlayingTrackID();

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className={styles.group}>
      <aside className={styles.aside}>
        {/** Instead of the first one, maybe get the first track within the album to hold a cover? */}
        <Cover track={tracks[0]} iconSize={36} noBorder />
        <h3 className={styles.label}>{label}</h3>
        <div className={styles.metadata}>
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
      <div className={styles.rows}>
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
