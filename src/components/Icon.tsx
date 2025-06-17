import { error } from '@tauri-apps/plugin-log';

import chevronDown from '../assets/icons/chevron-down.svg?react';
import chevronUp from '../assets/icons/chevron-up.svg?react';
import list from '../assets/icons/list.svg?react';
import microphone from '../assets/icons/microphone.svg?react';
import musicalNotes from '../assets/icons/musical-notes.svg?react';
import pause from '../assets/icons/pause.svg?react';
import play from '../assets/icons/play.svg?react';
import playlist from '../assets/icons/playlist.svg?react';
import plus from '../assets/icons/plus.svg?react';
import repeat from '../assets/icons/repeat.svg?react';
import repeatOne from '../assets/icons/repeat-one.svg?react';
import settings from '../assets/icons/settings.svg?react';
import shuffle from '../assets/icons/shuffle.svg?react';
import skipBack from '../assets/icons/skip-back.svg?react';
import skipForward from '../assets/icons/skip-forward.svg?react';
import volumeHigh from '../assets/icons/volume-high.svg?react';
import volumeLow from '../assets/icons/volume-low.svg?react';
import volumeMedium from '../assets/icons/volume-medium.svg?react';
import volumeMute from '../assets/icons/volume-mute.svg?react';
import volumeOff from '../assets/icons/volume-off.svg?react';
import styles from './Icon.module.css';

const icons: Record<
  string,
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  chevronDown,
  chevronUp,
  list,
  microphone,
  musicalNotes,
  pause,
  play,
  playlist,
  plus,
  repeat,
  repeatOne,
  settings,
  shuffle,
  skipBack,
  skipForward,
  volumeHigh,
  volumeLow,
  volumeMedium,
  volumeMute,
  volumeOff,
};

export type IconName = keyof typeof icons;
export type IconSize = 12 | 16 | 20 | 24 | 28 | 36;

type Props = {
  name: IconName;
  color?: string;
  size?: IconSize;
};

export default function Icon(props: Props) {
  const { name, size = 16 } = props;
  const IconImpl = icons[name];

  if (IconImpl === undefined) {
    error(`Icon "${name}" not found.`);
    return (
      <span
        className={styles.icon}
        style={{
          width: `${size}px`,
        }}
      >
        ?
      </span>
    );
  }

  return (
    <IconImpl
      className={styles.icon}
      style={{
        width: `${size}px`,
        color: props.color,
      }}
    />
  );
}
