import React, { useCallback } from 'react';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import Icon from 'react-fontawesome';
import { useSelector } from 'react-redux';

import { getStatus } from '../../lib/utils-library';
import { RootState } from '../../store/reducers';

import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const library = useSelector((state: RootState) => state.library);
  useLocation();
  const isPlaylistView = useLocation().pathname.startsWith('/playlists');

  const getStatusContent = useCallback(() => {
    const { processed, total } = library.refresh;

    if (library.refreshing) {
      const progress = total > 0 ? Math.round((processed / total) * 100) : 100;
      return (
        <div className={styles.footer__libraryRefresh}>
          <div className={styles.footer__libraryRefresh__progress}>
            <ProgressBar progress={progress} animated={total === 0} />
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
    return <>{getStatus(isPlaylistView ? library.tracks.playlist : library.tracks.library)}</>;
  }, [library.refresh, library.refreshing, library.tracks.library, library.tracks.playlist, isPlaylistView]);

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
};

export default Footer;
