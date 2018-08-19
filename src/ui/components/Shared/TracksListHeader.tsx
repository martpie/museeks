import * as React from 'react';
import { connect } from 'react-redux';

import TracksListHeaderCell from './TracksListHeaderCell';

import { SortBy, SortOrder } from '../../types/interfaces';
import { RootState } from '../../reducers';
import { LibrarySort } from '../../reducers/library';

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
      <div className='tracks-list-header'>
        <TracksListHeaderCell
          className='cell-track-playing'
          title='&nbsp;'
        />
        <TracksListHeaderCell
          className='cell-track'
          title='Title'
          sortBy={enableSort ? SortBy.TITLE : null}
          icon={TracksListHeader.getIcon(sort, SortBy.TITLE)}
        />
        <TracksListHeaderCell
          className='cell-duration'
          title='Duration'
          sortBy={enableSort ? SortBy.DURATION : null}
          icon={TracksListHeader.getIcon(sort, SortBy.DURATION)}
        />
        <TracksListHeaderCell
          className='cell-artist'
          title='Artist'
          sortBy={enableSort ? SortBy.ARTIST : null}
          icon={TracksListHeader.getIcon(sort, SortBy.ARTIST)}
        />
        <TracksListHeaderCell
          className='cell-album'
          title='Album'
          sortBy={enableSort ? SortBy.ALBUM : null}
          icon={TracksListHeader.getIcon(sort, SortBy.ALBUM)}
        />
        <TracksListHeaderCell
          className='cell-genre'
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
