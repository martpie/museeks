import { useLingui } from '@lingui/react/macro';
import * as Popover from '@radix-ui/react-popover';

import usePlayingTrack from '../hooks/usePlayingTrack';
import usePlayerStore from '../stores/usePlayerStore';
import styles from './Header.module.css';
import Icon from './Icon';
import PlayerControls from './PlayerControls';
import PlayingBar from './PlayingBar';
import Queue from './Queue';
import Search from './Search';

export default function Header() {
  const queue = usePlayerStore((state) => state.queue);
  const queueCursor = usePlayerStore((state) => state.queueCursor);
  const trackPlaying = usePlayingTrack();
  const { t } = useLingui();

  return (
    <header className={styles.header} data-tauri-drag-region>
      <div className={styles.headerMainControls} data-tauri-drag-region>
        <PlayerControls />
      </div>
      <div className={styles.headerPlayingBar} data-tauri-drag-region>
        {trackPlaying != null && (
          <>
            <PlayingBar trackPlaying={trackPlaying} />
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={styles.queueToggle}
                  data-tauri-drag-region
                  title={t`Queue`}
                  data-museeks-action
                >
                  <Icon name="queue" size={20} />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  sideOffset={0}
                  align="end"
                  alignOffset={-10}
                  avoidCollisions={false}
                  className={styles.queueContainer}
                >
                  <Queue queue={queue} queueCursor={queueCursor} />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </>
        )}
      </div>
      <div className={styles.headerSearch} data-tauri-drag-region>
        <Search />
      </div>
    </header>
  );
}
