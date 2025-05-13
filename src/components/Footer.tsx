import { useQuery } from '@tanstack/react-query';
import Icon from 'react-fontawesome';

import useLibraryStore from '../stores/useLibraryStore';
import ProgressBar from './ProgressBar';

import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import database from '../lib/database';
import usePlayerStore from '../stores/usePlayerStore';
import styles from './Footer.module.css';

export default function Footer() {
  const queueOrigin = usePlayerStore((state) => state.queueOrigin);

  // Footer artists/playlists links will by default redirect to the default view
  // with not artist/playlist selected.
  //
  // But in order to improve UX, we can:
  //
  // - fetch the first artist, and the first playlist
  // - get the queue origin
  // - pre-set the links URLs to the playing/first playlist and first artist.
  //
  // We do that instead of a redirect in loader() because Tanstack Router would
  // sometimes weirdly fully unmount/remount the view, leading to content flash,
  // which looks terrible.
  //
  // We also don't leverage root loader because this is fairly static data that
  // does not need to be refetched on each navigation.
  const { data } = useQuery({
    queryKey: ['footer'],
    queryFn: async () => {
      const [playlists, artists] = await Promise.all([
        database.getAllPlaylists(),
        database.getAllArtists(),
      ]);
      const firstPlaylistID: string | null = playlists[0]?.id ?? null;
      const firstArtistID: string | null = artists[0] ?? null;

      return {
        firstPlaylistID,
        firstArtistID,
      };
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [playlistProps, artistProps] = useMemo(() => {
    if (!data) {
      return [{ to: '/playlists' }, { to: '/artists' }];
    }

    const { firstPlaylistID, firstArtistID } = data;

    const playlistID =
      queueOrigin?.type === 'playlist'
        ? queueOrigin.playlistID
        : firstPlaylistID;

    return [
      { to: '/playlists/$playlistID', params: { playlistID } },
      { to: '/artists/$artistID', params: { artistID: firstArtistID } },
    ];
  }, [data, queueOrigin]);
  // End of the links computation

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
            {...artistProps}
            className={styles.footerNavigationLink}
            activeProps={{ className: styles.footerNavigationLinkIsActive }}
            title="Artists"
            draggable={false}
          >
            <Icon name="microphone" fixedWidth />
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
}
