import { useCallback } from 'react';
import Icon from 'react-fontawesome';

import useLibraryStore from '../stores/useLibraryStore';
import ProgressBar from './ProgressBar';

import { Link } from '@tanstack/react-router';
import styles from './Footer.module.css';

type Props = {
  /** If defined, the playlist link will redirect to it */
  playlistID: string | null;
};

export default function Footer(props: Props) {
  const { playlistID } = props;

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

  const playlistProps = playlistID
    ? { to: '/playlists/$playlistID', params: { playlistID } }
    : { to: '/playlists' };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerNavigation}>
        <div className={styles.footerNavigationLinkgroup}>
          <Link
            to="/library"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title="Library"
            draggable={false}
          >
            <Icon name="align-justify" fixedWidth />
          </Link>
          <Link
            {...playlistProps}
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title="Playlists"
            draggable={false}
          >
            <Icon name="star" fixedWidth />
          </Link>
          <Link
            to="/settings/library"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title="Settings"
            draggable={false}
          >
            <Icon name="gear" fixedWidth />
          </Link>
        </div>
      </div>
      <div className={styles.footerStatus}>{getStatusContent()}</div>
    </footer>
  );
}
