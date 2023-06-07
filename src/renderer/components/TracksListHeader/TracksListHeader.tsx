import TracksListHeaderCell from '../TracksListHeaderCell/TracksListHeaderCell';
import { LibrarySort, SortBy, SortOrder } from '../../../shared/types/museeks';
import useLibraryStore from '../../stores/useLibraryStore';

import styles from './TracksListHeader.module.css';

const getIcon = (sort: LibrarySort | undefined, sortType: SortBy) => {
  if (sort && sort.by === sortType) {
    if (sort.order === SortOrder.ASC) {
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
  const sort = useLibraryStore((state) => state.sort);

  return (
    <div className={styles.tracksListHeader}>
      <TracksListHeaderCell className={styles.cellTrackPlaying} title='&nbsp;' />
      <TracksListHeaderCell
        className={styles.cellTrack}
        title='Title'
        sortBy={enableSort ? SortBy.TITLE : null}
        icon={getIcon(sort, SortBy.TITLE)}
      />
      <TracksListHeaderCell
        className={styles.cellDuration}
        title='Duration'
        sortBy={enableSort ? SortBy.DURATION : null}
        icon={getIcon(sort, SortBy.DURATION)}
      />
      <TracksListHeaderCell
        className={styles.cellArtist}
        title='Artist'
        sortBy={enableSort ? SortBy.ARTIST : null}
        icon={getIcon(sort, SortBy.ARTIST)}
      />
      <TracksListHeaderCell
        className={styles.cellAlbum}
        title='Album'
        sortBy={enableSort ? SortBy.ALBUM : null}
        icon={getIcon(sort, SortBy.ALBUM)}
      />
      <TracksListHeaderCell
        className={styles.cellGenre}
        title='Genre'
        sortBy={enableSort ? SortBy.GENRE : null}
        icon={getIcon(sort, SortBy.GENRE)}
      />
    </div>
  );
}
