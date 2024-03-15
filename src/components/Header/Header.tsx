import Icon from 'react-fontawesome';
import * as Popover from '@radix-ui/react-popover';

import Queue from '../Queue/Queue';
import PlayingBar from '../PlayingBar/PlayingBar';
import PlayerControls from '../PlayerControls/PlayerControls';
import Search from '../Search/Search';
import usePlayerStore from '../../stores/usePlayerStore';
import usePlayingTrack from '../../hooks/usePlayingTrack';

import styles from './Header.module.css';

export default function Header() {
  const queue = usePlayerStore((state) => state.queue);
  const queueCursor = usePlayerStore((state) => state.queueCursor);
  const trackPlaying = usePlayingTrack();

  return (
    <header className={styles.header} data-tauri-drag-region>
      <div className={styles.header__mainControls} data-tauri-drag-region>
        <PlayerControls />
      </div>
      <div className={styles.header__playingBar} data-tauri-drag-region>
        {trackPlaying != null && (
          <>
            <PlayingBar trackPlaying={trackPlaying} />
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className={styles.queueToggle} data-tauri-drag-region>
                  <Icon name="list" data-museeks-action />
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
      <div className={styles.header__search} data-tauri-drag-region>
        <Search />
      </div>
    </header>
  );
}
