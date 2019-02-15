import * as React from 'react';
import { connect } from 'react-redux';

import TracksListHeaderCell from '../TracksListHeaderCell/TracksListHeaderCell';

import { SortBy, SortOrder } from '../../../shared/types/interfaces';
import { RootState } from '../../reducers';
import { LibrarySort } from '../../reducers/library';

import * as styles from './TracksListHeader.css';

interface OwnProps {
  enableSort: boolean;
}

interface InjectedProps {
  sort?: LibrarySort;
}

type Props = OwnProps & InjectedProps;

class TracksListHeader extends React.Component<Props> {
  static getIcon = (sort: LibrarySort | undefined, sortType: SortBy) => {
    if (sort && sort.by === sortType) {
      if (sort.order === SortOrder.ASC) {
        return 'angle-up';
      }

      // Must be DSC then
      return 'angle-down';
    }

    return null;
  }

  render () {
    const { enableSort, sort } = this.props;

    return (
      <div className={styles.tracksListHeader}>
        <TracksListHeaderCell
          className={styles.cellTrackPlaying}
          title='&nbsp;'
        />
        <TracksListHeaderCell
          className={styles.cellTrack}
          title='Title'
          sortBy={enableSort ? SortBy.TITLE : null}
          icon={TracksListHeader.getIcon(sort, SortBy.TITLE)}
        />
        <TracksListHeaderCell
          className={styles.cellDuration}
          title='Duration'
          sortBy={enableSort ? SortBy.DURATION : null}
          icon={TracksListHeader.getIcon(sort, SortBy.DURATION)}
        />
        <TracksListHeaderCell
          className={styles.cellArtist}
          title='Artist'
          sortBy={enableSort ? SortBy.ARTIST : null}
          icon={TracksListHeader.getIcon(sort, SortBy.ARTIST)}
        />
        <TracksListHeaderCell
          className={styles.cellAlbum}
          title='Album'
          sortBy={enableSort ? SortBy.ALBUM : null}
          icon={TracksListHeader.getIcon(sort, SortBy.ALBUM)}
        />
        <TracksListHeaderCell
          className={styles.cellGenre}
          title='Genre'
          sortBy={enableSort ? SortBy.GENRE : null}
          icon={TracksListHeader.getIcon(sort, SortBy.GENRE)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState, ownProps: OwnProps): InjectedProps => {
  if (ownProps.enableSort) {
    return {
      sort: state.library.sort
    };
  }

  return {};
};

export default connect(mapStateToProps)(TracksListHeader);
