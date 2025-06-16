import type React from 'react';

import Icon, { type IconName } from '../components/Icon';
import styles from './ButtonIcon.module.css';

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  icon: IconName;
  title?: string;
};

export default function ButtonIcon(props: Props) {
  return (
    <button
      type="button"
      className={styles.buttonIcon}
      onClick={props.onClick}
      title={props.title}
      data-museeks-action
    >
      <Icon name={props.icon} />
    </button>
  );
}
