import * as stylex from '@stylexjs/stylex';
import { error } from '@tauri-apps/plugin-log';

import album from '../assets/icons/album.svg?react';
import chevronDown from '../assets/icons/chevron-down.svg?react';
import chevronUp from '../assets/icons/chevron-up.svg?react';
import globe from '../assets/icons/globe.svg?react';
import list from '../assets/icons/list.svg?react';
import microphone from '../assets/icons/microphone.svg?react';
import musicalNotes from '../assets/icons/musical-notes.svg?react';
import pause from '../assets/icons/pause.svg?react';
import play from '../assets/icons/play.svg?react';
import playlist from '../assets/icons/playlist.svg?react';
import plus from '../assets/icons/plus.svg?react';
import repeatOne from '../assets/icons/repeat-one.svg?react';
import repeat from '../assets/icons/repeat.svg?react';
import settings from '../assets/icons/settings.svg?react';
import shuffle from '../assets/icons/shuffle.svg?react';
import skipBack from '../assets/icons/skip-back.svg?react';
import skipForward from '../assets/icons/skip-forward.svg?react';
import volumeHigh from '../assets/icons/volume-high.svg?react';
import volumeLow from '../assets/icons/volume-low.svg?react';
import volumeMedium from '../assets/icons/volume-medium.svg?react';
import volumeMute from '../assets/icons/volume-mute.svg?react';
import volumeOff from '../assets/icons/volume-off.svg?react';

const icons: Record<
  string,
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  album,
  chevronDown,
  chevronUp,
  globe,
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
export type IconSize = keyof typeof stylesBySize;

type Props = {
  name: IconName;
  color?: string;
  size?: IconSize;
  xstyle?: stylex.CompiledStyles;
};

export default function Icon(props: Props) {
  const { name, size = 16 } = props;
  const IconImpl = icons[name];

  if (IconImpl === undefined) {
    error(`Icon "${name}" not found.`);
    return (
      <span
        style={{
          color: props.color,
        }}
        {...stylex.props(styles.icon, stylesBySize[size], props.xstyle)}
      >
        ?
      </span>
    );
  }

  return (
    <IconImpl
      style={{
        color: props.color,
      }}
      {...stylex.props(styles.icon, stylesBySize[size], props.xstyle)}
    />
  );
}

const styles = stylex.create({
  icon: {
    display: 'inline-block',
    textAlign: 'center',
    aspectRatio: '1',
    fill: 'currentColor',
    lineHeight: 1,
  },
});

const stylesBySize = stylex.create({
  12: {
    width: '12px',
  },
  16: {
    width: '16px',
  },
  20: {
    width: '20px',
  },
  24: {
    width: '24px',
  },
  28: {
    width: '28px',
  },
  36: {
    width: '36px',
  },
});
