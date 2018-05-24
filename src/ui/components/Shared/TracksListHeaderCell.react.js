import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Icon from 'react-fontawesome';

import * as LibraryActions from '../../actions/LibraryActions';


class TracksListHeaderCell extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    sortBy: PropTypes.string,
    title: PropTypes.string.isRequired,
    icon: PropTypes.string,
  }

  static defaultProps = {
    className: '',
    sortBy: null,
    icon: null,
  }

  constructor(props) {
    super(props);
    this.sort = this.sort.bind(this);
  }

  sort() {
    LibraryActions.sort(this.props.sortBy);
  }

  render() {
    const {
      sortBy,
      className,
      title,
      icon,
    } = this.props;

    const classes = classnames('track-cell-header', className, {
      sort: sortBy,
    });

    const content = (
      <React.Fragment>
        <div className="col-name">
          {title}
        </div>
        {icon &&
          <div className="col-icon">
            <Icon name={icon} />
          </div>
        }
      </React.Fragment>
    );

    if (sortBy) {
      return (
        <button
          className={classes}
          onClick={this.sort}
        >
          {content}
        </button>
      );
    }

    return (
      <div className={classes}>
        {content}
      </div>
    );
  }
}

export default TracksListHeaderCell;
