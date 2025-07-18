import type React from 'react';

import Icon, { type IconName, type IconSize } from '../components/Icon';
import styles from './ButtonIcon.module.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  iconSize?: IconSize;
  isActive?: boolean;
};

export default function ButtonIcon(props: Props) {
  const { onClick, icon, iconSize, isActive, ...rest } = props;
  return (
    <button
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
