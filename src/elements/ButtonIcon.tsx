import type React from 'react';

import Icon, { type IconName, type IconSize } from '../components/Icon';
import styles from './ButtonIcon.module.css';

type Props = React.ComponentPropsWithRef<'button'> & {
  icon: IconName;
  iconSize?: IconSize;
  isActive?: boolean;
};

export default function ButtonIcon(props: Props) {
  const { onClick, icon, iconSize, isActive, ref, ...rest } = props;
  return (
    <button
      ref={ref}
      type="button"
      className={styles.buttonIcon}
      onClick={onClick}
      data-museeks-action
      {...rest}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={isActive ? 'var(--main-color)' : undefined}
        className={styles.icon}
      />
    </button>
  );
}
