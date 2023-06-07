import React, { useCallback, useEffect, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';

import useDebounce from '../../hooks/useDebounce';
import { isCtrlKey } from '../../lib/utils-events';
import { useLibraryAPI } from '../../stores/useLibraryStore';

import styles from './Search.module.css';

export default function Search() {
  const libraryAPI = useLibraryAPI();
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const onClear = useCallback(() => setSearch(''), []);
  const onChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    setSearch(event.currentTarget.value);
  }, []);

  useEffect(() => {
    if (search === '') {
      libraryAPI.search(search);
    } else {
      libraryAPI.search(debouncedSearch);
    }
  }, [libraryAPI, debouncedSearch, search]);

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
        type='text'
        className={styles.search__input}
        placeholder='search...'
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
