import next from '../assets/icons/player-next.svg?react';
import pause from '../assets/icons/player-pause.svg?react';
import play from '../assets/icons/player-play.svg?react';
import previous from '../assets/icons/player-previous.svg?react';
import queue from '../assets/icons/player-queue.svg?react';
import repeat_one from '../assets/icons/player-repeat-one.svg?react';
import repeat from '../assets/icons/player-repeat.svg?react';
import shuffle from '../assets/icons/player-shuffle.svg?react';

const icons = {
  next,
  pause,
  play,
  previous,
  queue,
  repeat_one,
  repeat,
  shuffle,
};

type Props = {
  name: keyof typeof icons;
  className?: string;
};

export default function Icon(props: Props) {
  const { name } = props;
  const IconComponent = icons[name];

  return <IconComponent className={props.className} />;
}
