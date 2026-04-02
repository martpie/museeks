import * as stylex from '@stylexjs/stylex';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import React, { useCallback } from 'react';

import type { Config, SortBy, SortOrder } from '../generated/typings';
import ConfigBridge from '../lib/bridge-config';
import { configQuery } from '../lib/queries';
import Icon from './Icon';

type Props = {
  title: string;
  xstyle?: stylex.CompiledStyles;
  sortBy?: SortBy | null;
};

export default function TrackListHeaderCell(props: Props) {
  const { sortBy, xstyle, title } = props;
  const queryClient = useQueryClient();

  const config = useSuspenseQuery(configQuery).data;

  const icon =
    sortBy && config.library_sort_by === sortBy
      ? config.library_sort_order === 'Asc'
        ? 'chevronUp'
        : 'chevronDown'
      : null;

  const sortMutation = useMutation({
    mutationFn: async (newSort: { sortBy: SortBy; sortOrder: SortOrder }) => {
      await Promise.all([
        ConfigBridge.set('library_sort_by', newSort.sortBy),
        ConfigBridge.set('library_sort_order', newSort.sortOrder),
      ]);
    },
    onMutate: async (newSort) => {
      await queryClient.cancelQueries({ queryKey: configQuery.queryKey });
      const previousConfig = queryClient.getQueryData<Config>(
        configQuery.queryKey,
      );
      queryClient.setQueryData(configQuery.queryKey, {
        ...previousConfig,
        library_sort_by: newSort.sortBy,
        library_sort_order: newSort.sortOrder,
      });
      return { previousConfig };
    },
  });

  const handleSort = useCallback(() => {
    if (!sortBy) return;
    const newSortOrder: SortOrder =
      sortBy === config.library_sort_by
        ? config.library_sort_order === 'Asc'
          ? 'Dsc'
          : 'Asc'
        : 'Asc';
    sortMutation.mutate({ sortBy, sortOrder: newSortOrder });
  }, [sortBy, config.library_sort_by, config.library_sort_order, sortMutation]);

  const content = (
    <React.Fragment>
      <div {...stylex.props(styles.name)}>{title}</div>
      {icon && (
        <div {...stylex.props(styles.icon)}>
          <Icon name={icon} size={12} />
        </div>
      )}
    </React.Fragment>
  );

  return (
    <button
      type="button"
      disabled={sortBy === null}
      onClick={handleSort}
      {...stylex.props(
        styles.trackCellHeader,
        sortBy && styles.sortable,
        xstyle,
      )}
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
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    marginBlock: '4px',
    marginInline: '0',
    paddingBlock: '0',
    paddingInline: '4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
