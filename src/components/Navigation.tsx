import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { Link } from '@tanstack/react-router';

import useLibraryStore from '../stores/useLibraryStore';
import Icon from './Icon';
import ProgressBar from './ProgressBar';
import TrackListStatus from './TrackListStatus';

export default function Navigation() {
  const { t } = useLingui();

  return (
    <div {...stylex.props(styles.navigation)}>
      <div {...stylex.props(styles.viewLinksContainer)}>
        <NavigationMenu.Root
          orientation="horizontal"
          aria-label={t`Main navigation`}
        >
          <NavigationMenu.List {...stylex.props(styles.viewLinks)}>
            <NavigationMenu.Item {...stylex.props(styles.navigationItem)}>
              <NavigationMenu.Link
                render={(renderProps) => (
                  <Link
                    {...renderProps}
                    to="/library"
                    title={t`Library`}
                    draggable={false}
                    data-testid="footer-library-link"
                    {...stylex.props(styles.navigationLink)}
                  >
                    <Icon name="musicalNotes" size={16} />
                  </Link>
                )}
              />
            </NavigationMenu.Item>
            <NavigationMenu.Item {...stylex.props(styles.navigationItem)}>
              <NavigationMenu.Link
                render={(renderProps) => (
                  <Link
                    {...renderProps}
                    to="/artists"
                    title={t`Artists`}
                    draggable={false}
                    data-testid="footer-artists-link"
                    {...stylex.props(styles.navigationLink)}
                  >
                    <Icon name="microphone" size={16} />
                  </Link>
                )}
              />
            </NavigationMenu.Item>
            <NavigationMenu.Item {...stylex.props(styles.navigationItem)}>
              <NavigationMenu.Link
                render={(renderProps) => (
                  <Link
                    {...renderProps}
                    to="/playlists"
                    title={t`Playlists`}
                    draggable={false}
                    data-testid="footer-playlists-link"
                    {...stylex.props(styles.navigationLink)}
                  >
                    <Icon name="playlist" size={16} />
                  </Link>
                )}
              />
            </NavigationMenu.Item>
            <NavigationMenu.Item {...stylex.props(styles.navigationItem)}>
              <NavigationMenu.Link
                render={(renderProps) => (
                  <Link
                    {...renderProps}
                    to="/settings"
                    title={t`Settings`}
                    draggable={false}
                    data-testid="footer-settings-link"
                    {...stylex.props(styles.navigationLink)}
                  >
                    <Icon name="settings" size={16} />
                  </Link>
                )}
              />
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
      <div {...stylex.props(styles.status)} aria-label={t`Library status`}>
        <Status />
      </div>
    </div>
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
      <div {...stylex.props(styles.statusLibraryRefresh)}>
        <div {...stylex.props(styles.statusLibraryRefreshProgress)}>
          {isScanning ? (
            t`scanning tracks...`
          ) : (
            <ProgressBar progress={progress} />
          )}
        </div>
        {total > 0 && (
          <div {...stylex.props(styles.statusLibraryRefreshCount)}>
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
  navigation: {
    order: 2,
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
  viewLinksContainer: {
    display: 'flex',
    alignItems: 'stretch',
    width: '30%',
  },
  viewLinks: {
    display: 'flex',
    alignItems: 'stretch',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  navigationItem: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
    borderBlockWidth: '0',
    borderInlineWidth: '1px',
    marginLeft: {
      default: '-1px',
      ':first-child': '0',
    },
  },
  navigationLink: {
    color: {
      default: 'inherit',
      ':hover': 'inherit',
      ':focus': 'inherit',
      '[data-status="active"]': 'var(--main-color)',
    },
    paddingBlock: '8px',
    paddingInline: '12px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: {
      ':active': 'var(--footer-nav-bg-color-active)',
      '[data-status="active"]': 'var(--footer-nav-bg-color-active)',
    },
    zIndex: {
      ':active': 1,
    },
  },
  status: {
    width: '40%',
    textAlign: 'center',
    fontSize: '12px',
    paddingTop: '7px',
    paddingBottom: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLibraryRefresh: {
    display: 'flex',
    flex: '1',
    alignItems: 'center',
  },
  statusLibraryRefreshProgress: {
    flex: '1',
    marginRight: '10px',
  },
  statusLibraryRefreshCount: {
    fontVariantNumeric: 'tabular-nums',
  },
});
