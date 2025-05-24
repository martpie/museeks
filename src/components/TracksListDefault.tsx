import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useVirtualizer } from '@tanstack/react-virtual';
import type React from 'react';
import { useCallback, useImperativeHandle, useRef } from 'react';

import type { Track } from '../generated/typings';
import useDndSensors from '../hooks/useDnDSensors';
import usePlayingTrackID from '../hooks/usePlayingTrackID';
import type { TracksListVirtualizer } from '../types/museeks';
import TrackRow, { type TrackRowEvents } from './TrackRow';
import TracksListHeader from './TracksListHeader';

import styles from './TracksList.module.css';

const DND_MODIFIERS = [restrictToVerticalAxis];

/** ----------------------------------------------------------------------------
 * List-based layout for TracksList:
 *  - Uses a Virtual List
 *  - Reorderable if needed (for playlists)
 * -------------------------------------------------------------------------- */
type Props = {
  ref: React.RefObject<TracksListVirtualizer | null>;
  tracks: Track[];
  isSortEnabled: boolean;
  reorderable?: boolean;
  selectedTracks: Set<string>;
  initialOffset: number;
  rowHeight: number;
  onReorder?: (tracks: Track[]) => void;
} & TrackRowEvents;

export default function TrackListDefault(props: Props) {
  const {
    ref,
    tracks,
    isSortEnabled,
    reorderable,
    selectedTracks,
    initialOffset,
    rowHeight,
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
    estimateSize: () => rowHeight,
    getItemKey: (index) => tracks[index].id,
  });

  // Passes the ref back to the master component for interaction with the
  // scrollable view
  useImperativeHandle(
    ref,
    () => {
      return {
        scrollElement: innerScrollableRef.current,
        scrollToIndex: (index) => {
          virtualizer.scrollToIndex(index);
        },
      } satisfies TracksListVirtualizer;
    },
    [virtualizer],
  );

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
                  onTrackSelect={onTrackSelect}
                  onContextMenu={onContextMenu}
                  onPlaybackStart={onPlaybackStart}
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
