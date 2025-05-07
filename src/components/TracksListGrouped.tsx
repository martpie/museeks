import { type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import { useImperativeHandle, useRef } from 'react';

import type { Config, TrackGroup } from '../generated/typings';
import usePlayingTrackID from '../hooks/usePlayingTrackID';

import Flexbox from '../elements/Flexbox';
import Cover from './Cover';
import TrackRow from './TrackRow';
import styles from './TracksList.module.css';

/** ----------------------------------------------------------------------------
 * Group-based layout for TracksList:
 *  - Uses a Virtual List
 *  - Non-reorderable
 * -------------------------------------------------------------------------- */

type Props = {
  ref: React.RefObject<Virtualizer<HTMLDivElement, Element> | null>;
  trackGroups: TrackGroup[];
  tracksDensity: Config['track_view_density'];
  selectedTracks: Set<string>;
  initialOffset: number;
  onTrackSelect: (event: React.MouseEvent, trackID: string) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => Promise<void>;
  onPlaybackStart: (trackID: string) => Promise<void>;
};

export default function TrackListGroupedLayout(props: Props) {
  const {
    ref,
    trackGroups,
    tracksDensity,
    selectedTracks,
    initialOffset,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;

  const trackPlayingID = usePlayingTrackID();
  const innerScrollableRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: trackGroups.length,
    initialOffset,
    overscan: 20,
    scrollPaddingEnd: 22, // Height of the track list header
    getScrollElement: () => innerScrollableRef.current,
    estimateSize(index) {
      return 0;
    },
  });

  // Passes the ref back to the master component for interaction with the
  // scrollable view
  useImperativeHandle(ref, () => virtualizer, [virtualizer]);

  console.log('render', trackGroups);

  return (
    <div ref={innerScrollableRef} className={styles.tracksListScroller}>
      {trackGroups.map((trackGroup) => {
        return (
          <div
            // Label should be unique due to how the tracks are grouped from get_artist_tracks()
            key={trackGroup.label}
            className={styles.tracksGroup}
          >
            <div className={styles.tracksGroupMetadata}>
              {/** Instead of the first one, maybe get the first track within the album to hold a cover? */}
              <Cover track={trackGroup.tracks[0]} noteSize={5} />
            </div>
            <div className={styles.tracksGroupContent}>
              <h3 className={styles.tracksGroupLabel}>{trackGroup.label}</h3>
              {trackGroup.tracks.map((track, index) => {
                return (
                  <TrackRow
                    key={track.id}
                    selected={selectedTracks.has(track.id)}
                    track={track}
                    isPlaying={trackPlayingID === track.id}
                    index={index}
                    onMouseDown={onTrackSelect}
                    onContextMenu={onContextMenu}
                    onDoubleClick={onPlaybackStart}
                    draggable={false}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
