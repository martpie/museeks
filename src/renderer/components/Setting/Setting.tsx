import React from 'react';
import styles from './Setting.module.css';

type Props = {
  children: React.ReactNode;
};

export const Section: React.FC<Props> = (props) => (
  <section className={styles.settingSection}>{props.children}</section>
);

export const Description: React.FC<Props> = (props) => <p className={styles.settingDescription}>{props.children}</p>;

export const Label: React.FC<JSX.IntrinsicElements['label']> = (props) => {
  const { children, ...restProps } = props;

  return (
    <label className={styles.settingLabel} {...restProps}>
      {props.children}
    </label>
  );
};

export const Title: React.FC<Props> = (props) => <span className={styles.settingTitle}>{props.children}</span>;

export const Input: React.FC<JSX.IntrinsicElements['input']> = (props) => {
  const { children, ...restProps } = props;

  return (
    <input className={styles.settingInput} {...restProps}>
      {props.children}
    </input>
  );
};

export const Error: React.FC<Props> = (props) => <p className={styles.settingError}>{props.children}</p>;

export const Select: React.FC<JSX.IntrinsicElements['select']> = (props) => (
  <select className={styles.settingSelect} {...props}>
    {props.children}
  </select>
);
