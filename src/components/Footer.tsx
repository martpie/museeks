import { useCallback } from 'react';
import Icon from 'react-fontawesome';
import { NavLink } from 'react-router-dom';

import useLibraryStore from '../stores/useLibraryStore';
import ProgressBar from './ProgressBar';

import styles from './Footer.module.css';

export default function Footer() {
  const refresh = useLibraryStore((state) => state.refresh);
  const refreshing = useLibraryStore((state) => state.refreshing);
  const status = useLibraryStore((state) => state.tracksStatus);

  const getStatusContent = useCallback(() => {
    const { current, total } = refresh;

    if (refreshing) {
      // Sketchy
      const isScanning = total === 0;
      const progress = total > 0 ? Math.round((current / total) * 100) : 100;

      return (
        <div className={styles.footer__libraryRefresh}>
          <div className={styles.footer__libraryRefresh__progress}>
            {isScanning ? (
              <>scanning tracks...</>
            ) : (
              <ProgressBar progress={progress} animated={total === 0} />
            )}
          </div>
          {total > 0 && (
            <div className={styles.footer__libraryRefresh__count}>
              {current} / {total}
            </div>
          )}
        </div>
      );
    }

    return status;
  }, [refresh, refreshing, status]);

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__navigation}>
        <div className={styles.footer__navigation__linkgroup}>
          <NavLink
            to="/library"
            className={({ isActive }) =>
              `${styles.footer__navigation__link} ${
                isActive && styles.footer__navigation__linkIsActive
              }`
            }
            title="Library"
            draggable={false}
          >
            <Icon name="align-justify" fixedWidth />
          </NavLink>
          <NavLink
            to="/playlists"
            className={({ isActive }) =>
              `${styles.footer__navigation__link} ${
                isActive && styles.footer__navigation__linkIsActive
              }`
            }
            title="Playlists"
            draggable={false}
          >
            <Icon name="star" fixedWidth />
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.footer__navigation__link} ${
                isActive && styles.footer__navigation__linkIsActive
              }`
            }
            title="Settings"
            draggable={false}
          >
            <Icon name="gear" fixedWidth />
          </NavLink>
        </div>
      </div>
      <div className={styles.footer__status}>{getStatusContent()}</div>
    </footer>
  );
}
