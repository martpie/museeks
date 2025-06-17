import { useLingui } from '@lingui/react/macro';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import cx from 'classnames';

import type { Track } from '../generated/typings';
import useCover from '../hooks/useCover';
import styles from './Cover.module.css';
import Icon, { type IconSize } from './Icon';

type Props = {
  track: Track;
  noBorder?: boolean;
  iconSize?: IconSize;
};

export default function Cover(props: Props) {
  const coverPath = useCover(props.track);
  const { t } = useLingui();

  const classes = cx(styles.cover, styles.empty, {
    [styles.noBorder]: props.noBorder,
  });

  return (
    <AspectRatio.Root ratio={1}>
      <div className={classes}>
        <div className={styles.note}>
          <Icon name="musicalNotes" size={props.iconSize} />
        </div>
        <img
          src={coverPath ?? undefined}
          alt={t`Album cover`}
          className={cx(styles.image, {
            [styles.visible]: coverPath != null,
          })}
          draggable={false}
          aria-hidden={coverPath === null}
        />
      </div>
    </AspectRatio.Root>
  );
}
