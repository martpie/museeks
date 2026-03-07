import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import { AspectRatio } from 'radix-ui';

import type { Track } from '../generated/typings';
import useCover from '../hooks/useCover';
import Icon, { type IconSize } from './Icon';

type Props = {
  track: Track;
  noHorizontalBorder?: boolean;
  iconSize?: IconSize;
};

export default function Cover(props: Props) {
  const coverPath = useCover(props.track);
  const { t } = useLingui();

  return (
    <AspectRatio.Root ratio={1}>
      <div
        sx={[
          styles.cover,
          coverPath != null && styles.noBorder,
          coverPath == null &&
            props.noHorizontalBorder &&
            styles.noHorizontalBorder,
        ]}
      >
        <div sx={styles.note}>
          <Icon name="musicalNotes" size={props.iconSize} />
        </div>
        <img
          src={coverPath ?? undefined}
          alt={t`Album cover`}
          draggable={false}
          aria-hidden={coverPath === null}
          sx={[styles.image, coverPath != null && styles.visible]}
        />
      </div>
    </AspectRatio.Root>
  );
}

const styles = stylex.create({
  cover: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    backgroundColor: 'var(--cover-bg)',
    position: 'relative',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border-color)',
  },
  image: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
    transition: 'none',
  },
  visible: {
    opacity: 1,
    transition: '0.2s ease-in-out',
  },
  noBorder: {
    borderWidth: '0',
    borderStyle: 'none',
  },
  noHorizontalBorder: {
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  note: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    lineHeight: 1,
  },
});
