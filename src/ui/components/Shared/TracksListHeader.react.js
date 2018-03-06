import React from 'react';
import PropTypes from 'prop-types';

import TracksListHeaderCell from './TracksListHeaderCell.react';

import LibraryActions from '../../actions/LibraryActions';
import * as sort from '../../constants/sort-types';


class TracksListHeader extends React.Component {
  static propTypes = {
    enableSort: PropTypes.bool,
  }

  sort(type) {
    LibraryActions.sort(type);
  }

  render() {
    const { enableSort } = this.props;

    return (
      <React.Fragment>
        <TracksListHeaderCell
          className='cell-track-playing'
          title='&nbsp;'
        />
        <TracksListHeaderCell
          className='cell-track'
          title='Title'
          sortBy={enableSort ? sort.TITLE : null}
          onClick={enableSort ? this.sort : null}
        />
        <TracksListHeaderCell
          className='cell-duration'
          title='Duration'
          sortBy={enableSort ? sort.DURATION : null}
          onClick={enableSort ? this.sort : null}
        />
        <TracksListHeaderCell
          className='cell-artist'
          title='Artist'
          sortBy={enableSort ? sort.ARTIST : null}
          onClick={enableSort ? this.sort : null}
        />
        <TracksListHeaderCell
          className='cell-album'
          title='Album'
          sortBy={enableSort ? sort.ALBUM : null}
          onClick={enableSort ? this.sort : null}
        />
        <TracksListHeaderCell
          className='cell-genre'
          title='Genre'
          sortBy={enableSort ? sort.GENRE : null}
          onClick={enableSort ? this.sort : null}
        />
      </React.Fragment>
    );
  }
}

export default TracksListHeader;
