import type React from 'react';
import Icon from 'react-fontawesome';

import styles from './ButtonIcon.module.css';

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  icon: string;
  title?: string;
};

export default function ButtonIcon(props: Props) {
  return (
    <button
      type="button"
      className={styles.buttonIcon}
      onClick={props.onClick}
      title={props.title}
      data-syncudio-action
    >
      <Icon name={props.icon} />
    </button>
  );
}
