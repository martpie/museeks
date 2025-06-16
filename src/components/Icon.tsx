import { error } from '@tauri-apps/plugin-log';
import {
  playForwardSharp as next,
  pauseSharp as pause,
  playSharp as play,
  playBackSharp as previous,
  listSharp as queue,
  repeat,
  shuffle,
} from 'ionicons/icons';
import { defineCustomElements } from 'ionicons/loader';

// import repeat_one from '../assets/icons/player-repeat-one.svg?react';
// import repeat from '../assets/icons/player-repeat.svg?react';
// maybe keep this one?
// import shuffle from '../assets/icons/player-shuffle.svg?react';

import './Icon.module.css';

defineCustomElements(window);

const icons: Record<string, string | undefined> = {
  next,
  pause,
  play,
  previous,
  queue,
  repeat_one: repeat,
  repeat,
  shuffle,
};

type Props = {
  name: keyof typeof icons;
  fill?: string;
  className?: string;
};

export default function Icon(props: Props) {
  const { name, fill, className } = props;
  const icon = icons[name];

  if (icon === undefined) {
    error(`Icon "${name}" not found.`);
    return null;
  }

  return (
    <ion-icon
      icon={icon}
      style={{ color: fill ?? 'currentColor' }}
      className={className}
    />
  );
}
