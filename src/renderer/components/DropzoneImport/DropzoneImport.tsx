import React from 'react';

import styles from './DropzoneImport.module.css';

interface Props {
  title: string;
  subtitle: string;
  shown: boolean;
}

const DropzoneImport: React.FC<Props> = (props) => {
  return (
    <div className={`${styles.dropzone} ${props.shown && styles.shown}`}>
      <div className={styles.dropzone__title}>{props.title}</div>
      <div className={styles.dropzone__subtitle}>{props.subtitle}</div>
    </div>
  );
};

export default DropzoneImport;
