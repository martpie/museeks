import React from 'react';

import styles from './Setting.module.css';

type Props = {
  children: React.ReactNode;
};

export function Section(props: Props) {
  return <section className={styles.settingSection}>{props.children}</section>;
}

export function Description(props: Props) {
  return <p className={styles.settingDescription}>{props.children}</p>;
}

export function Label(props: JSX.IntrinsicElements['label']) {
  const { children, ...restProps } = props;

  return (
    <label className={styles.settingLabel} {...restProps}>
      {props.children}
    </label>
  );
}

export function Title(props: Props) {
  return <span className={styles.settingTitle}>{props.children}</span>;
}

export function Input(props: JSX.IntrinsicElements['input']) {
  return <input className={styles.settingInput} {...props} />;
}

export function Error(props: Props) {
  return <p className={styles.settingError}>{props.children}</p>;
}

export function Select(props: Props & JSX.IntrinsicElements['select']) {
  return (
    <select className={styles.settingSelect} {...props}>
      {props.children}
    </select>
  );
}
