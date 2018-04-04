import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from 'react-fontawesome';

import * as LibraryActions from '../../actions/LibraryActions';


class TracksListHeaderCell extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    sortBy: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
    icon: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.sort = this.sort.bind(this);
  }

  sort() {
    LibraryActions.sort(this.props.sortBy);
  }

  getCellContent(props) {
    return (
      <React.Fragment>
        <div className='col-name'>
          {props.title}
        </div>
        {props.icon &&
          <div className='col-icon'>
            <Icon name={props.icon} />
          </div>
        }
      </React.Fragment>
    );
  }


  render() {
    const { sortBy, className } = this.props;
    const classes = classnames('track-cell-header', className, {
      sort: sortBy,
    });

    if (sortBy) {
      return (
        <button
          className={classes}
          onClick={this.sort}
        >
          {this.getCellContent(this.props)}
        </button>
      );
    }

    return (
      <div className={classes}>
        {this.getCellContent(this.props)}
      </div>
    );
  }
}

export default TracksListHeaderCell;
