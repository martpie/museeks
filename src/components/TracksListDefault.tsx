import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import type React from 'react';
import { useCallback, useImperativeHandle, useRef } from 'react';

import TrackRow from './TrackRow';
import TracksListHeader from './TracksListHeader';

import type { Config, Track } from '../generated/typings';
import useDndSensors from '../hooks/useDnDSensors';
import usePlayingTrackID from '../hooks/usePlayingTrackID';

import styles from './TracksList.module.css';

const ROW_HEIGHT = 30;
const ROW_HEIGHT_COMPACT = 24;
const DND_MODIFIERS = [restrictToVerticalAxis];

/** ----------------------------------------------------------------------------
 * List-based layout for TracksList:
 *  - Uses a Virtual List
 *  - Reorderable if needed (for playlists)
 * -------------------------------------------------------------------------- */
type Props = {
  ref: React.RefObject<Virtualizer<HTMLDivElement, Element> | null>;
  tracks: Track[];
  tracksDensity: Config['track_view_density'];
  isSortEnabled: boolean;
  reorderable?: boolean;
  selectedTracks: Set<string>;
  initialOffset: number;
  onReorder?: (tracks: Track[]) => void;
  onTrackSelect: (event: React.MouseEvent, trackID: string) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => Promise<void>;
  onPlaybackStart: (trackID: string) => Promise<void>;
};

export default function TrackListDefault(props: Props) {
  const {
    ref,
    tracks,
    tracksDensity,
    isSortEnabled,
    reorderable,
    selectedTracks,
    initialOffset,
    onReorder,
    onTrackSelect,
    onContextMenu,
    onPlaybackStart,
  } = props;

  const trackPlayingID = usePlayingTrackID();
  const innerScrollableRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tracks.length,
    initialOffset,
    overscan: 20,
    scrollPaddingEnd: 22, // Height of the track list header
    getScrollElement: () => innerScrollableRef.current,
    estimateSize: () => {
      switch (tracksDensity) {
        case 'compact':
          return ROW_HEIGHT_COMPACT;
        default:
          return ROW_HEIGHT;
      }
    },
    getItemKey: (index) => tracks[index].id,
  });

  // Passes the ref back to the master component for interaction with the
  // scrollable view
  useImperativeHandle(ref, () => virtualizer, [virtualizer]);

  /**
   * Playlist tracks re-order events handlers
   */
  const sensors = useDndSensors();

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const {
        active, // dragged item
        over, // on which item it was dropped
      } = event;

      // The item was dropped either nowhere, or on the same item
      if (over == null || active.id === over.id || !onReorder) {
        return;
      }

      const activeIndex = tracks.findIndex((track) => track.id === active.id);
      const overIndex = tracks.findIndex((track) => track.id === over.id);

      const newTracks = [...tracks];

      const movedTrack = newTracks.splice(activeIndex, 1)[0]; // Remove active track
      newTracks.splice(overIndex, 0, movedTrack); // Move it to where the user dropped it

      onReorder(newTracks);
    },
    [onReorder, tracks],
  );

  return (
    <DndContext
      onDragEnd={onDragEnd}
      id="dnd-playlist"
      modifiers={DND_MODIFIERS}
      sensors={sensors}
    >
      <div ref={innerScrollableRef} className={styles.tracksListScroller}>
        <TracksListHeader enableSort={isSortEnabled} />

        {/* The large inner element to hold all of the items */}
        <div
          className={styles.tracksListRows}
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <SortableContext
            items={tracks}
            strategy={verticalListSortingStrategy}
          >
            {/* Only the visible items in the virtualizer, manually positioned to be in view */}
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const track = tracks[virtualItem.index];
              return (
                <TrackRow
                  key={virtualItem.key}
                  selected={selectedTracks.has(track.id)}
                  track={track}
                  isPlaying={trackPlayingID === track.id}
                  index={virtualItem.index}
                  onMouseDown={onTrackSelect}
                  onContextMenu={onContextMenu}
                  onDoubleClick={onPlaybackStart}
                  draggable={reorderable}
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    // Intentionally not translateY, as it would create another paint
                    // layer where every row would cover elements from the previous one.
                    // This would typically prevent the drop effect to be properly displayed
                    // when reordering a playlist
                    top: `${virtualItem.start}px`,
                    zIndex: 1,
                  }}
                />
              );
            })}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}
