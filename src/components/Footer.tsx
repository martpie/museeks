import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import Icon from 'react-fontawesome';

import useLibraryStore from '../stores/useLibraryStore';
import styles from './Footer.module.css';
import ProgressBar from './ProgressBar';
import TrackListStatus from './TrackListStatus';

export default function Footer() {
  const { t } = useLingui();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerNavigation}>
        <div className={styles.footerNavigationLinkgroup}>
          <Link
            to="/library"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Library`}
            draggable={false}
          >
            <Icon name="align-justify" fixedWidth />
          </Link>
          <Link
            to="/artists"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Artists`}
            draggable={false}
          >
            <Icon name="microphone" fixedWidth />
          </Link>
          <Link
            to="/playlists"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Playlists`}
            draggable={false}
          >
            <Icon name="star" fixedWidth />
          </Link>
          <Link
            to="/settings"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Settings`}
            draggable={false}
          >
            <Icon name="gear" fixedWidth />
          </Link>
        </div>
      </div>
      <div className={styles.footerStatus}>
        <Status />
      </div>
    </footer>
  );
}

function Status() {
  const refresh = useLibraryStore((state) => state.refresh);
  const refreshing = useLibraryStore((state) => state.refreshing);
  const status = useLibraryStore((state) => state.tracksStatus);
  const { t } = useLingui();

  const { current, total } = refresh;

  if (refreshing) {
    // Sketchy
    const isScanning = total === 0;
    const progress = total > 0 ? Math.round((current / total) * 100) : 100;

    return (
      <div className={styles.footerLibraryRefresh}>
        <div className={styles.footerLibraryRefreshProgress}>
          {isScanning ? (
            t`scanning tracks...`
          ) : (
            <ProgressBar progress={progress} />
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

  if (status != null) {
    return <TrackListStatus {...status} />;
  }

  return null;
}
