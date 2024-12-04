import type { SortBy, SortOrder } from '../generated/typings';
import useLibraryStore from '../stores/useLibraryStore';
import TracksListHeaderCell from './TracksListHeaderCell';

import styles from './TracksListHeader.module.css';

const getIcon = (
  enableSort: boolean,
  sortBy: SortBy,
  sortOrder: SortOrder,
  sortByTarget: SortBy,
) => {
  if (!enableSort) {
    return null;
  }

  if (sortBy === sortByTarget) {
    if (sortOrder === 'Asc') {
      return 'angle-up';
    }

    // Must be DSC then
    return 'angle-down';
  }

  return null;
};

type Props = {
  enableSort: boolean;
};

export default function TracksListHeader(props: Props) {
  const { enableSort } = props;
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);

  return (
    <div className={styles.tracksListHeader}>
      <TracksListHeaderCell
        className={styles.cellTrackPlaying}
        title="&nbsp;"
      />
      <TracksListHeaderCell
        className={styles.cellTrack}
        title="Title"
        sortBy={enableSort ? 'Title' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Title')}
      />
      <TracksListHeaderCell
        className={styles.cellDuration}
        title="Duration"
        sortBy={enableSort ? 'Duration' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Duration')}
      />
      <TracksListHeaderCell
        className={styles.cellArtist}
        title="Artist"
        sortBy={enableSort ? 'Artist' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Artist')}
      />
      <TracksListHeaderCell
        className={styles.cellAlbum}
        title="Album"
        sortBy={enableSort ? 'Album' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Album')}
      />
      <TracksListHeaderCell
        className={styles.cellGenre}
        title="Genre"
        sortBy={enableSort ? 'Genre' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Genre')}
      />
    </div>
  );
}
