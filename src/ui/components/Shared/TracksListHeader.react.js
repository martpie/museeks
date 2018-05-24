import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TracksListHeaderCell from './TracksListHeaderCell.react';

import * as SORT from '../../constants/sort-types';


class TracksListHeader extends React.Component {
  static propTypes = {
    enableSort: PropTypes.bool,
    sort: PropTypes.object,
  }

  static defaultProps = {
    enableSort: false,
    sort: {},
  }

  static getIcon = (sort, sortType) => {
    if (typeof sort === 'object' && sort.by === sortType) {
      if (sort.order === SORT.ASC) {
        return 'angle-up';
      }

      // Must be DSC then
      return 'angle-down';
    }

    return null;
  }

  render() {
    const { enableSort, sort } = this.props;

    return (
      <div className="tracks-list-header">
        <TracksListHeaderCell
          className="cell-track-playing"
          title="&nbsp;"
        />
        <TracksListHeaderCell
          className="cell-track"
          title="Title"
          sortBy={enableSort ? SORT.TITLE : null}
          icon={TracksListHeader.getIcon(sort, SORT.TITLE)}
        />
        <TracksListHeaderCell
          className="cell-duration"
          title="Duration"
          sortBy={enableSort ? SORT.DURATION : null}
          icon={TracksListHeader.getIcon(sort, SORT.DURATION)}
        />
        <TracksListHeaderCell
          className="cell-artist"
          title="Artist"
          sortBy={enableSort ? SORT.ARTIST : null}
          icon={TracksListHeader.getIcon(sort, SORT.ARTIST)}
        />
        <TracksListHeaderCell
          className="cell-album"
          title="Album"
          sortBy={enableSort ? SORT.ALBUM : null}
          icon={TracksListHeader.getIcon(sort, SORT.ALBUM)}
        />
        <TracksListHeaderCell
          className="cell-genre"
          title="Genre"
          sortBy={enableSort ? SORT.GENRE : null}
          icon={TracksListHeader.getIcon(sort, SORT.GENRE)}
        />
      </div>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  if (ownProps.enableSort) {
    return {
      sort: state.library.sort,
    };
  }

  return {};
};

export default connect(mapStateToProps)(TracksListHeader);
