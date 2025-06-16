import { error } from '@tauri-apps/plugin-log';
import {
  caretDown,
  caretUp,
  menu as library,
  mic as microphone,
  playForwardSharp as next,
  pauseSharp as pause,
  playSharp as play,
  add as plus,
  playBackSharp as previous,
  listSharp as queue,
  repeat,
  options as settings,
  shuffle,
  star,
  volumeHigh,
  volumeLow,
  volumeMedium,
  volumeMute,
  volumeOff,
} from 'ionicons/icons';
import { defineCustomElements } from 'ionicons/loader';

// import repeat_one from '../assets/icons/player-repeat-one.svg?react';
// import repeat from '../assets/icons/player-repeat.svg?react';
// maybe keep this one?
// import shuffle from '../assets/icons/player-shuffle.svg?react';

import './Icon.module.css';

defineCustomElements(window);

const icons = {
  next,
  pause,
  play,
  previous,
  queue,
  repeat_one: repeat,
  repeat,
  shuffle,
  plus,
  microphone,
  star,
  library,
  settings,
  'caret-up': caretUp,
  'caret-down': caretDown,
  'volume-high': volumeHigh,
  'volume-low': volumeLow,
  'volume-medium': volumeMedium,
  'volume-off': volumeOff,
  'volume-mute': volumeMute,
};

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  fill?: string;
  className?: string;
  size?: 12 | 16 | 20 | 24;
};

export default function Icon(props: Props) {
  const { name, fill, className, size = 16 } = props;
  const icon: string | undefined = icons[name];

  if (icon === undefined) {
    error(`Icon "${name}" not found.`);
    return null;
  }

  return (
    <ion-icon
      icon={icon}
      style={{
        color: fill ?? undefined,
        fontSize: `${size}px`,
      }}
      className={className}
    />
  );
}
