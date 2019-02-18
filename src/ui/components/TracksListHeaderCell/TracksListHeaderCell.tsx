import * as React from 'react';
import cx from 'classnames';
import * as Icon from 'react-fontawesome';

import * as LibraryActions from '../../actions/LibraryActions';
import { SortBy } from '../../../shared/types/interfaces';

import * as styles from './TracksListHeaderCell.css';

interface Props {
  title: string;
  className?: string;
  sortBy?: SortBy | null;
  icon?: string | null;
}

class TracksListHeaderCell extends React.Component<Props> {
  static defaultProps = {
    className: '',
    sortBy: null,
    icon: null
  };

  constructor (props: Props) {
    super(props);
    this.sort = this.sort.bind(this);
  }

  sort () {
    if (this.props.sortBy) {
      LibraryActions.sort(this.props.sortBy);
    }
  }

  render () {
    const {
      sortBy,
      className,
      title,
      icon
    } = this.props;

    const classes = cx(styles.trackCellHeader, className, {
      [styles.sort]: sortBy
    });

    const content = (
      <React.Fragment>
        <div className={styles.name}>
          {title}
        </div>
        {icon &&
          <div className={styles.icon}>
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
