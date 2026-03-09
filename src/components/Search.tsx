import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import type React from 'react';
import { useCallback, useRef } from 'react';
import Keybinding from 'react-keybinding-component';

import { isCtrlKey } from '../lib/utils-events';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

export default function Search() {
  const search = useLibraryStore((state) => state.search);
  const libraryAPI = useLibraryAPI();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLingui();

  const onClear = useCallback(() => libraryAPI.search(''), [libraryAPI]);
  const onChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      libraryAPI.search(event.currentTarget.value);
    },
    [libraryAPI],
  );

  const onFocus = useCallback<React.FocusEventHandler<HTMLInputElement>>(
    (e) => e.currentTarget.select(),
    [],
  );

  // ctrl/cmf+f shortcut
  const onKey = (e: KeyboardEvent) => {
    if (isCtrlKey(e) && e.key.toLowerCase() === 'f') {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  return (
    <div {...stylex.props(styles.searchContainer)}>
      <input
        type="text"
        {...stylex.props(styles.searchInput)}
        placeholder={t`search...`}
        value={search}
        onChange={onChange}
        onFocus={onFocus}
        onMouseUp={(e) => e.preventDefault()}
        spellCheck={false}
        ref={inputRef}
        data-testid="library-search"
      />
      {search.length > 0 && (
        <button
          type="button"
          {...stylex.props(styles.searchClear)}
          onClick={onClear}
          data-museeks-action
          data-testid="library-search-clear"
        >
          &times;
        </button>
      )}
      <Keybinding preventInputConflict onKey={onKey} />
    </div>
  );
}

const styles = stylex.create({
  searchContainer: {
    position: 'relative',
    maxWidth: '180px',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    display: 'block',
    fontSize: 'inherit',
    width: '100%',
    paddingBlock: '6px',
    paddingInline: '12px',
    backgroundColor: 'var(--search-bg)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    color: 'var(--text)',
    borderRadius: 'var(--border-radius)',
    lineHeight: '16px',
  },
  searchClear: {
    position: 'absolute',
    right: '4px',
    zIndex: 1,
    fontSize: '15px',
    color: 'var(--text)',
    cursor: 'pointer',
    borderStyle: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    height: '21px',
    aspectRatio: '1 / 1',
    lineHeight: '100%',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  },
});
