import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';

import type { SortBy, SortOrder } from '../generated/typings';
import useLibraryStore from '../stores/useLibraryStore';
import type { IconName } from './Icon';
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
    <div {...stylex.props(styles.trackListHeader)}>
      <TrackListHeaderCell
        xstyle={styles.cellTrackPlaying}
        title="&nbsp;"
        sortBy={null}
      />
      <TrackListHeaderCell
        xstyle={styles.cellTrack}
        title={t`Title`}
        sortBy={enableSort ? 'Title' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Title')}
        data-testid="tracklist-header-title"
      />
      <TrackListHeaderCell
        xstyle={styles.cellDuration}
        title={t`Duration`}
        sortBy={enableSort ? 'Duration' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Duration')}
        data-testid="tracklist-header-duration"
      />
      <TrackListHeaderCell
        xstyle={styles.cellArtist}
        title={t`Artist`}
        sortBy={enableSort ? 'Artist' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Artist')}
        data-testid="tracklist-header-artist"
      />
      <TrackListHeaderCell
        xstyle={styles.cellAlbum}
        title={t`Album`}
        sortBy={enableSort ? 'Album' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Album')}
        data-testid="tracklist-header-album"
      />
      <TrackListHeaderCell
        xstyle={styles.cellGenre}
        title={t`Genre`}
        sortBy={enableSort ? 'Genre' : null}
        icon={getIcon(enableSort, sortBy, sortOrder, 'Genre')}
        data-testid="tracklist-header-genre"
      />
    </div>
  );
}

const styles = stylex.create({
  trackListHeader: {
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border-color)',
    color: 'var(--tracks-header-color)',
    backgroundColor: 'var(--tracks-header-bg)',
    display: 'flex',
    width: '100%',
    position: 'sticky',
    top: 0,
    zIndex: 5,
  },
  cellTrackPlaying: {
    width: '30px',
  },
  cellTrack: {
    flex: '1',
  },
  cellDuration: {
    width: '7%',
    minWidth: '70px',
  },
  cellArtist: {
    width: '20%',
  },
  cellAlbum: {
    width: '20%',
  },
  cellGenre: {
    width: '20%',
  },
});
