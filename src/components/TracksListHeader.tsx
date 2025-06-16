import { useLingui } from '@lingui/react/macro';

import type { SortBy, SortOrder } from '../generated/typings';
import useLibraryStore from '../stores/useLibraryStore';
import type { IconName } from './Icon';
import styles from './TracksListHeader.module.css';
import TracksListHeaderCell from './TracksListHeaderCell';

const getIcon = (
  enableSort: boolean,
  sortBy: SortBy,
  sortOrder: SortOrder,
  sortByTarget: SortBy,
): IconName | null => {
  if (!enableSort) {
    return null;
  }

  if (sortBy === sortByTarget) {
    if (sortOrder === 'Asc') {
      return 'caret-up';
    }

    // Must be DSC then
    return 'caret-down';
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
  const { t } = useLingui();

  return (
    <div className={styles.tracksListHeader}>
      <TracksListHeaderCell
        className={styles.cellTrackPlaying}
        title="&nbsp;"
      />
      <TracksListHeaderCell
        className={styles.cellTrack}
        title={t`Title`}
        sortBy={enableSort ? 'Title' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Title')}
      />
      <TracksListHeaderCell
        className={styles.cellDuration}
        title={t`Duration`}
        sortBy={enableSort ? 'Duration' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Duration')}
      />
      <TracksListHeaderCell
        className={styles.cellArtist}
        title={t`Artist`}
        sortBy={enableSort ? 'Artist' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Artist')}
      />
      <TracksListHeaderCell
        className={styles.cellAlbum}
        title={t`Album`}
        sortBy={enableSort ? 'Album' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Album')}
      />
      <TracksListHeaderCell
        className={styles.cellGenre}
        title={t`Genre`}
        sortBy={enableSort ? 'Genre' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Genre')}
      />
    </div>
  );
}
