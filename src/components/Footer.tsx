import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';

import useLibraryStore from '../stores/useLibraryStore';
import Icon from './Icon';
import ProgressBar from './ProgressBar';
import TrackListStatus from './TrackListStatus';

export default function Footer() {
  const { t } = useLingui();

  return (
    <footer {...stylex.props(styles.footer)}>
      <div {...stylex.props(styles.footerNavigation)}>
        <div {...stylex.props(styles.footerNavigationLinkgroup)}>
          <Link
            to="/library"
            activeProps={stylex.props(styles.footerNavigationLinkIsActive)}
            title={t`Library`}
            draggable={false}
            data-testid="footer-library-link"
            {...stylex.props(styles.footerNavigationLink)}
          >
            <Icon name="musicalNotes" size={16} />
          </Link>
          <Link
            to="/artists"
            activeProps={stylex.props(styles.footerNavigationLinkIsActive)}
            title={t`Artists`}
            draggable={false}
            data-testid="footer-artists-link"
            {...stylex.props(styles.footerNavigationLink)}
          >
            <Icon name="microphone" size={16} />
          </Link>
          <Link
            to="/playlists"
            activeProps={stylex.props(styles.footerNavigationLinkIsActive)}
            title={t`Playlists`}
            draggable={false}
            data-testid="footer-playlists-link"
            {...stylex.props(styles.footerNavigationLink)}
          >
            <Icon name="playlist" size={16} />
          </Link>
          <Link
            to="/settings"
            activeProps={stylex.props(styles.footerNavigationLinkIsActive)}
            title={t`Settings`}
            draggable={false}
            data-testid="footer-settings-link"
            {...stylex.props(styles.footerNavigationLink)}
          >
            <Icon name="settings" size={16} />
          </Link>
        </div>
      </div>
      <div {...stylex.props(styles.footerStatus)}>
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
      <div {...stylex.props(styles.footerLibraryRefresh)}>
        <div {...stylex.props(styles.footerLibraryRefreshProgress)}>
          {isScanning ? (
            t`scanning tracks...`
          ) : (
            <ProgressBar progress={progress} />
          )}
        </div>
        {total > 0 && (
          <div {...stylex.props(styles.footerLibraryRefreshCount)}>
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

const styles = stylex.create({
  footer: {
    backgroundColor: 'var(--footer-bg)',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border-color)',
    flex: '0 0 auto',
    paddingBlock: '0',
    paddingInline: '15px',
    display: 'flex',
    alignItems: 'stretch',
  },
  footerNavigation: {
    display: 'flex',
    alignItems: 'stretch',
    width: '30%',
  },
  footerNavigationLinkgroup: {
    display: 'flex',
    alignItems: 'stretch',
  },
  footerNavigationLink: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderBlockWidth: '0',
    borderInlineWidth: '1px',
    color: {
      default: 'inherit',
      ':hover': 'inherit',
      ':focus': 'inherit',
    },
    paddingBlock: '8px',
    paddingInline: '12px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: {
      ':active': 'var(--footer-nav-bg-color-active)',
    },
    zIndex: {
      ':active': 1,
    },
    marginLeft: {
      default: '-1px',
      ':first-child': '0',
    },
  },
  footerNavigationLinkIsActive: {
    backgroundColor: 'var(--footer-nav-bg-color-active)',
    color: 'var(--main-color)',
  },
  footerStatus: {
    width: '40%',
    textAlign: 'center',
    fontSize: '12px',
    paddingTop: '7px',
    paddingBottom: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLibraryRefresh: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },
  footerLibraryRefreshProgress: {
    flex: '1',
    marginRight: '10px',
  },
  footerLibraryRefreshCount: {
    fontVariantNumeric: 'tabular-nums',
  },
});
