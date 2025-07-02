import cx from 'classnames';
import React, { useCallback } from 'react';

import type { SortBy } from '../generated/typings';
import { useLibraryAPI } from '../stores/useLibraryStore';
import Icon, { type IconName } from './Icon';
import styles from './TrackListHeaderCell.module.css';

type Props = {
  title: string;
  className?: string;
  sortBy?: SortBy | null;
  icon?: IconName | null;
};

export default function TrackListHeaderCell(props: Props) {
  const { sortBy, className, title, icon } = props;
  const libraryAPI = useLibraryAPI();

  const sort = useCallback(() => {
    if (sortBy) {
      libraryAPI.sort(sortBy);
    }
  }, [libraryAPI, sortBy]);

  const classes = cx(styles.trackCellHeader, className, {
    [styles.sort]: sortBy,
  });

  const content = (
    <React.Fragment>
      <div className={styles.name}>{title}</div>
      {icon && (
        <div className={styles.icon}>
          <Icon name={icon} size={12} />
        </div>
      )}
    </React.Fragment>
  );

  return (
    <button
      type="button"
      className={classes}
      disabled={sortBy === null}
      onClick={sort}
    >
      {content}
    </button>
  );
}
