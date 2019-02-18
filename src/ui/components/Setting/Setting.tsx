import * as React from 'react';
import * as styles from './Setting.css';

export const Section: React.FC = (props) => (
  <section className={styles.settingSection}>
    {props.children}
  </section>
);

export const Title: React.FC = (props) => (
  <span className={styles.settingTitle}>
    {props.children}
  </span>
);

export const Description: React.FC = (props) => (
  <p className={styles.settingDescription}>
    {props.children}
  </p>
);

export const Label: React.FC<React.HTMLProps<HTMLLabelElement>> = (props) => {
  const { children, ...restProps } = props;

  return (
    <label
      className={styles.settingLabel}
      {...restProps}
    >
      {props.children}
    </label>
  );
};

export const Input: React.FC<React.HTMLProps<HTMLInputElement>> = (props) => {
  const { children, ...restProps } = props;

  return (
    <input
      className={styles.settingInput}
      {...restProps}
    >
      {props.children}
    </input>
  );
};
