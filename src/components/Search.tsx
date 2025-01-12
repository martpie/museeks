import type React from 'react';
import { useCallback, useRef } from 'react';
import Keybinding from 'react-keybinding-component';

import { isCtrlKey } from '../lib/utils-events';
import useLibraryStore, { useLibraryAPI } from '../stores/useLibraryStore';

import styles from './Search.module.css';

export default function Search() {
  const search = useLibraryStore((state) => state.search);
  const libraryAPI = useLibraryAPI();
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="search..."
        value={search}
        onChange={onChange}
        onFocus={onFocus}
        onMouseUp={(e) => e.preventDefault()}
        spellCheck={false}
        ref={inputRef}
      />
      {search.length > 0 && (
        <button
          type="button"
          className={styles.searchClear}
          onClick={onClear}
          data-syncudio-action
        >
          &times;
        </button>
      )}
      <Keybinding preventInputConflict onKey={onKey} />
    </div>
  );
}
