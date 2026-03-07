import * as stylex from '@stylexjs/stylex';
import React, { useCallback } from 'react';

import type { SortBy } from '../generated/typings';
import { useLibraryAPI } from '../stores/useLibraryStore';
import Icon, { type IconName } from './Icon';

type Props = {
  title: string;
  sx?: stylex.CompiledStyles;
  sortBy?: SortBy | null;
  icon?: IconName | null;
  'data-testid'?: string;
};

export default function TrackListHeaderCell(props: Props) {
  const { sortBy, sx, title, icon } = props;
  const libraryAPI = useLibraryAPI();

  const sort = useCallback(() => {
    if (sortBy) {
      libraryAPI.sort(sortBy);
    }
  }, [libraryAPI, sortBy]);

  const content = (
    <React.Fragment>
      <div sx={styles.name}>{title}</div>
      {icon && (
        <div sx={styles.icon}>
          <Icon name={icon} size={12} />
        </div>
      )}
    </React.Fragment>
  );

  return (
    <button
      type="button"
      disabled={sortBy === null}
      onClick={sort}
      data-testid={props['data-testid']}
      sx={[styles.trackCellHeader, sortBy && styles.sortable, sx]}
    >
      {content}
    </button>
  );
}

const styles = stylex.create({
  trackCellHeader: {
    fontWeight: 'var(--bold)',
    appearance: 'none',
    borderWidth: '0',
    backgroundColor: 'transparent',
    textAlign: 'left',
    padding: 0,
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    borderLeftWidth: {
      ':not(:first-child)': '1px',
    },
    borderLeftStyle: {
      ':not(:first-child)': 'solid',
    },
    borderLeftColor: {
      ':not(:first-child)': 'var(--border-color)',
    },
  },
  sortable: {
    backgroundColor: {
      default: 'transparent',
      ':focus': 'rgba(0 0 0 / 0.025)',
      ':active': 'rgba(0 0 0 / 0.04)',
    },
  },
  icon: {
    marginBlock: '4px',
    marginInline: '0',
    paddingBlock: '0',
    paddingInline: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  name: {
    flex: '1',
    marginBlock: '4px',
    marginInline: '0',
    paddingBlock: '0',
    paddingInline: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
