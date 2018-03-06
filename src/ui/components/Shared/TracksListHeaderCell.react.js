import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';


class TracksListHeaderCell extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    sortBy: PropTypes.string,
    title: PropTypes.string,
    onClick: PropTypes.func,
  }

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.onClick(this.props.sortBy);
  }

  render() {
    const { sortBy, className, title } = this.props;
    const classes = classnames('track-cell-header', className, {
      sort: sortBy,
    });

    if (sortBy) {
      return (
        <button
          className={classes}
          onClick={this.onClick}
        >
          <div className='col-name'>
            {title}
          </div>
        </button>
      );
    }

    return (
      <div className={classes}>
        <div className='col-name'>
          {title}
        </div>
      </div>
    );
  }
}

export default TracksListHeaderCell;
