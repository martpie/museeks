import { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from 'react-fontawesome';

import ProgressBar from '../ProgressBar/ProgressBar';
import useLibraryStore from '../../stores/useLibraryStore';

import styles from './Footer.module.css';

export default function Footer() {
  const { refresh, refreshing } = useLibraryStore();

  const getStatusContent = useCallback(() => {
    const { processed, total } = refresh;

    if (refreshing) {
      // Sketchy
      const isScanning = total === 0;
      const progress = total > 0 ? Math.round((processed / total) * 100) : 100;

      return (
        <div className={styles.footer__libraryRefresh}>
          <div className={styles.footer__libraryRefresh__progress}>
            {isScanning ? <>scanning tracks...</> : <ProgressBar progress={progress} animated={total === 0} />}
          </div>
          {total > 0 && (
            <div className={styles.footer__libraryRefresh__count}>
              {processed} / {total}
            </div>
          )}
        </div>
      );
    }

    // Else, return the amount of time for the library or the playlist depending
    // of the route
    // TODO: fix playlist view
    return null;
    // return <>{getStatus(library.tracks)}</>;
  }, [refresh, refreshing]);

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__navigation}>
        <div className={styles.footer__navigation__linkgroup}>
          <NavLink
            to='/library'
            className={({ isActive }) =>
              `${styles.footer__navigation__link} ${isActive && styles.footer__navigation__linkIsActive}`
            }
            title='Library'
            draggable={false}
          >
            <Icon name='align-justify' fixedWidth />
          </NavLink>
          <NavLink
            to='/playlists'
            className={({ isActive }) =>
              `${styles.footer__navigation__link} ${isActive && styles.footer__navigation__linkIsActive}`
            }
            title='Playlists'
            draggable={false}
          >
            <Icon name='star' fixedWidth />
          </NavLink>
          <NavLink
            to='/settings'
            className={({ isActive }) =>
              `${styles.footer__navigation__link} ${isActive && styles.footer__navigation__linkIsActive}`
            }
            title='Settings'
            draggable={false}
          >
            <Icon name='gear' fixedWidth />
          </NavLink>
        </div>
      </div>
      <div className={styles.footer__status}>{getStatusContent()}</div>
    </footer>
  );
}
