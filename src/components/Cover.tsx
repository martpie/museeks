import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import cx from 'classnames';

import type { Track } from '../generated/typings';
import useCover from '../hooks/useCover';

import styles from './Cover.module.css';

type Props = {
  track: Track;
  noBorder?: boolean;
  noteSize?: number;
};

export default function Cover(props: Props) {
  const coverPath = useCover(props.track);

  const classes = cx(styles.cover, styles.empty, {
    [styles.noBorder]: props.noBorder,
  });

  return (
    <AspectRatio.Root ratio={1}>
      <div className={classes}>
        {/** billion dollar problem: convert emoji to text, good luck 🎵 */}
        <div
          className={styles.note}
          style={{
            fontSize: `${props.noteSize ?? 1}rem`,
            lineHeight: `${props.noteSize ?? 1}rem`,
            // the note always seems a bit "high"
            marginBottom: `-${(props.noteSize ?? 1) / 10}rem`,
          }}
        >
          ♫
        </div>
        <img
          src={coverPath ?? undefined}
          alt="Album cover"
          className={cx(styles.image, {
            [styles.visible]: coverPath != null,
          })}
          draggable={false}
        />
      </div>
    </AspectRatio.Root>
  );
}
