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
        <div className={styles.footerLibraryRefresh}>
          <div className={styles.footerLibraryRefreshProgress}>
            {isScanning ? (
              <>scanning tracks...</>
            ) : (
              <ProgressBar progress={progress} animated={total === 0} />
            )}
          </div>
          {total > 0 && (
            <div className={styles.footerLibraryRefreshCount}>
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
      <div className={styles.footerNavigation}>
        <div className={styles.footerNavigationLinkgroup}>
          <NavLink
            to="/library"
            className={({ isActive }) =>
              `${styles.footerNavigationLink} ${
                isActive && styles.footerNavigationLinkIsActive
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
              `${styles.footerNavigationLink} ${
                isActive && styles.footerNavigationLinkIsActive
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
              `${styles.footerNavigationLink} ${
                isActive && styles.footerNavigationLinkIsActive
              }`
            }
            title="Settings"
            draggable={false}
          >
            <Icon name="gear" fixedWidth />
          </NavLink>
        </div>
      </div>
      <div className={styles.footerStatus}>{getStatusContent()}</div>
    </footer>
  );
}
