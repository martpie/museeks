import cx from 'classnames';

import styles from './DropzoneImport.module.css';

type Props = {
  title: string;
  subtitle: string;
  shown: boolean;
};

export default function DropzoneImport(props: Props) {
  const classes = cx(styles.dropzone, {
    [styles.shown]: props.shown,
  });

  return (
    <div className={classes}>
      <div className={styles.dropzone__title}>{props.title}</div>
      <div className={styles.dropzone__subtitle}>{props.subtitle}</div>
    </div>
  );
}
