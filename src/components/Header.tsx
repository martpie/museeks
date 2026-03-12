import { Drawer } from '@base-ui/react/drawer';
import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';

import ButtonIcon from '../elements/ButtonIcon';
import { usePlayerState } from '../hooks/usePlayer';
import usePlayingTrack from '../hooks/usePlayingTrack';
import PlayerControls from './PlayerControls';
import PlayingBar from './PlayingBar';
import Queue from './Queue';
import Search from './Search';

export default function Header() {
  const queue = usePlayerState((state) => state.queue);
  const queueCursor = usePlayerState((state) => state.queueCursor);
  const trackPlaying = usePlayingTrack();
  const { t } = useLingui();
  const platform = window.__MUSEEKS_PLATFORM;

  return (
    <header
      aria-label={t`Header`}
      {...stylex.props(
        styles.header,
        (platform === 'windows' || platform === 'linux') &&
          styles.headerBorderTop,
      )}
      data-tauri-drag-region
    >
      <div
        {...stylex.props(
          styles.headerMainControls,
          platform === 'macos' && styles.headerMainControlsMacos,
        )}
        data-tauri-drag-region
      >
        <PlayerControls />
      </div>
      <div {...stylex.props(styles.headerPlayingBar)} data-tauri-drag-region>
        {trackPlaying != null && (
          <>
            <PlayingBar trackPlaying={trackPlaying} />
            <Drawer.Root swipeDirection="left" modal={false}>
              <div {...stylex.props(styles.queue)}>
                <Drawer.Trigger
                  render={(triggerProps) => (
                    <ButtonIcon
                      {...triggerProps}
                      icon="list"
                      iconSize={20}
                      title={t`Queue`}
                      data-tauri-drag-region
                    />
                  )}
                />
              </div>
              <Drawer.Portal>
                <Drawer.Viewport {...stylex.props(styles.queueViewport)}>
                  <Drawer.Popup {...stylex.props(styles.queuePopup)}>
                    <Drawer.Title {...stylex.props(styles.srOnly)}>
                      {t`Queue`}
                    </Drawer.Title>
                    <Queue queue={queue} queueCursor={queueCursor} />
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          </>
        )}
      </div>
      <div {...stylex.props(styles.headerSearch)} data-tauri-drag-region>
        <Search />
      </div>
    </header>
  );
}

const styles = stylex.create({
  header: {
    boxSizing: 'border-box',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--border-color)',
    backgroundColor: 'var(--header-bg)',
    color: 'var(--header-color)',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: '10px',
    paddingRight: '10px',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    height: '50px',
    flex: '0 0 auto',
  },
  headerBorderTop: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--border-color)',
  },
  headerMainControls: {
    flex: '0 0 auto',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '10px',
    minWidth: '200px',
    paddingLeft: '12px',
  },
  headerMainControlsMacos: {
    paddingLeft: '72px',
  },
  headerSearch: {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  headerPlayingBar: {
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: '600px',
    display: 'flex',
  },
  queue: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: '16px',
    marginRight: '16px',
    display: 'flex',
    alignItems: 'center',
  },
  queueBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    transitionProperty: 'background-color',
    transitionDuration: '200ms',
    backgroundColor: {
      default: 'rgba(0, 0, 0, 0)',
      ':is([data-starting-style])': 'rgba(0, 0, 0, 0)',
      ':is([data-open])': 'rgba(0, 0, 0, 0.2)',
    },
  },
  queueViewport: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
  },
  queuePopup: {
    width: '300px',
    height: '100%',
    transform: 'translateX(0)',
    transitionProperty: 'transform',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease',
    ':is([data-starting-style])': {
      transform: 'translateX(100%)',
    },
    ':is([data-ending-style])': {
      transform: 'translateX(100%)',
    },
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});
