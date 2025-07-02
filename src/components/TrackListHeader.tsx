import { useLingui } from '@lingui/react/macro';

import type { SortBy, SortOrder } from '../generated/typings';
import useLibraryStore from '../stores/useLibraryStore';
import type { IconName } from './Icon';
import styles from './TrackListHeader.module.css';
import TrackListHeaderCell from './TrackListHeaderCell';

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
      return 'chevronUp';
    }

    // Must be DSC then
    return 'chevronDown';
  }

  return null;
};

type Props = {
  enableSort: boolean;
};

export default function TrackListHeader(props: Props) {
  const { enableSort } = props;
  const sortBy = useLibraryStore((state) => state.sortBy);
  const sortOrder = useLibraryStore((state) => state.sortOrder);
  const { t } = useLingui();

  return (
    <div className={styles.trackListHeader}>
      <TrackListHeaderCell className={styles.cellTrackPlaying} title="&nbsp;" />
      <TrackListHeaderCell
        className={styles.cellTrack}
        title={t`Title`}
        sortBy={enableSort ? 'Title' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Title')}
      />
      <TrackListHeaderCell
        className={styles.cellDuration}
        title={t`Duration`}
        sortBy={enableSort ? 'Duration' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Duration')}
      />
      <TrackListHeaderCell
        className={styles.cellArtist}
        title={t`Artist`}
        sortBy={enableSort ? 'Artist' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Artist')}
      />
      <TrackListHeaderCell
        className={styles.cellAlbum}
        title={t`Album`}
        sortBy={enableSort ? 'Album' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Album')}
      />
      <TrackListHeaderCell
        className={styles.cellGenre}
        title={t`Genre`}
        sortBy={enableSort ? 'Genre' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Genre')}
      />
    </div>
  );
}
