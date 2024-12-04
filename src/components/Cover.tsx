import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import cx from 'classnames';

import type { Track } from '../generated/typings';
import useCover from '../hooks/useCover';

import styles from './Cover.module.css';

type Props = {
  track: Track;
  noBorder?: boolean;
};

export default function Cover(props: Props) {
  const coverPath = useCover(props.track);

  if (coverPath) {
    return (
      <AspectRatio.Root ratio={1}>
        <img src={coverPath} alt="Album cover" className={styles.cover} />
      </AspectRatio.Root>
    );
  }

  const classes = cx(styles.cover, styles.empty, {
    [styles.no_border]: props.noBorder,
  });

  return (
    <AspectRatio.Root ratio={1}>
      <div className={classes}>
        {/** billion dollar problem: convert emoji to text, good luck 🎵 */}
        <div className={styles.cover__note}>♪</div>
      </div>
    </AspectRatio.Root>
  );
}
