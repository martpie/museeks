import React, { useCallback, useRef } from 'react';
import Keybinding from 'react-keybinding-component';

import { isCtrlKey } from '../../lib/utils-events';
import useLibraryStore, { useLibraryAPI } from '../../stores/useLibraryStore';

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

  // ctrl/cmf+f shortcut
  const onKey = (e: KeyboardEvent) => {
    if (isCtrlKey(e) && e.key.toLowerCase() === 'f') {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  return (
    <div className={styles.search__container}>
      <input
        type="text"
        className={styles.search__input}
        placeholder="search..."
        value={search}
        onChange={onChange}
        ref={inputRef}
      />
      {search.length > 0 && (
        <button className={styles.search__clear} onClick={onClear}>
          &times;
        </button>
      )}
      <Keybinding preventInputConflict onKey={onKey} />
    </div>
  );
}
