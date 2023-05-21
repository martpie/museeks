import React, { useCallback } from 'react';
import cx from 'classnames';
import Icon from 'react-fontawesome';

import * as LibraryActions from '../../store/actions/LibraryActions';
import { SortBy } from '../../../shared/types/museeks';

import styles from './TracksListHeaderCell.module.css';

type Props = {
  title: string;
  className?: string;
  sortBy?: SortBy | null;
  icon?: string | null;
};

export default function TracksListHeaderCell(props: Props) {
  const { sortBy, className, title, icon } = props;

  const sort = useCallback(() => {
    if (sortBy) {
      LibraryActions.sort(sortBy);
    }
  }, [sortBy]);

  const classes = cx(styles.trackCellHeader, className, {
    [styles.sort]: sortBy,
  });

  const content = (
    <React.Fragment>
      <div className={styles.name}>{title}</div>
      {icon && (
        <div className={styles.icon}>
          <Icon name={icon} />
        </div>
      )}
    </React.Fragment>
  );

  if (sortBy) {
    return (
      <button className={classes} onClick={sort}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
