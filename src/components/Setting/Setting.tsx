import cx from 'classnames';
import type React from 'react';

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

export function Label(
  props: JSX.IntrinsicElements['label'] & {
    noMargin?: boolean;
  },
) {
  const { children, noMargin, ...restProps } = props;

  const classNames = cx(styles.settingLabel, {
    noMargin,
  });

  return (
    <label className={classNames} {...restProps}>
      {children}
    </label>
  );
}

export function Title(props: Props) {
  return <h3 className={styles.settingTitle}>{props.children}</h3>;
}

export type InputProps = {
  label: string;
  description?: string;
  id: string;
};

export function Input(props: JSX.IntrinsicElements['input'] & InputProps) {
  const { label, description, id, ...otherProps } = props;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} className={styles.settingInput} {...otherProps} />
      {description != null && <Description>{description}</Description>}
    </div>
  );
}

export function ErrorMessage(props: Props) {
  return <p className={styles.settingError}>{props.children}</p>;
}

export function Select(
  props: Props & JSX.IntrinsicElements['select'] & InputProps,
) {
  const { label, description, id, ...otherProps } = props;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select className={styles.settingSelect} {...otherProps}>
        {props.children}
      </select>
      {description != null && <Description>{description}</Description>}
    </div>
  );
}
