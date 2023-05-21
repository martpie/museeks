import React, { useCallback, useEffect, useRef, useState } from 'react';
import Keybinding from 'react-keybinding-component';

import * as LibraryActions from '../../store/actions/LibraryActions';
import useDebounce from '../../hooks/useDebounce';
import { isCtrlKey } from '../../lib/utils-events';

import styles from './Search.module.css';

function Search() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const onClear = useCallback(() => setSearch(''), []);
  const onChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    setSearch(event.currentTarget.value);
  }, []);

  useEffect(() => {
    if (search === '') {
      LibraryActions.search(search);
    } else {
      LibraryActions.search(debouncedSearch);
    }
  }, [debouncedSearch, search]);

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

export default Search;
