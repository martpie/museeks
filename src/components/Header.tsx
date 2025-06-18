import { useLingui } from '@lingui/react/macro';
import * as Popover from '@radix-ui/react-popover';

import ButtonIcon from '../elements/ButtonIcon';
import usePlayingTrack from '../hooks/usePlayingTrack';
import usePlayerStore from '../stores/usePlayerStore';
import styles from './Header.module.css';
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
              <div className={styles.queue}>
                <Popover.Trigger asChild>
                  <ButtonIcon
                    icon="list"
                    iconSize={20}
                    title={t`Queue`}
                    data-tauri-drag-region
                  />
                </Popover.Trigger>
              </div>
              <Popover.Anchor />
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="end"
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
