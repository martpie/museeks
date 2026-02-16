import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import useLibraryStore from '../stores/useLibraryStore';
import styles from './Footer.module.css';
import Icon from './Icon';
import ProgressBar from './ProgressBar';
import TrackListStatus from './TrackListStatus';

export default function FooterContent() {
  const { t } = useLingui();

  return (
    <>
      <div className={styles.footerNavigation}>
        <div className={styles.footerNavigationLinkgroup}>
          <Link
            to="/library"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Library`}
            draggable={false}
            data-testid="footer-library-link"
          >
            <Icon name="musicalNotes" size={16} />
          </Link>
          <Link
            to="/artists"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Artists`}
            draggable={false}
            data-testid="footer-artists-link"
          >
            <Icon name="microphone" size={16} />
          </Link>
          <Link
            to="/playlists"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Playlists`}
            draggable={false}
            data-testid="footer-playlists-link"
          >
            <Icon name="playlist" size={16} />
          </Link>
          <Link
            to="/settings"
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title={t`Settings`}
            draggable={false}
            data-testid="footer-settings-link"
          >
            <Icon name="settings" size={16} />
          </Link>
        </div>
      </div>
      <div className={styles.footerStatus}>
        <Status />
      </div>
    </>
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
