import cx from 'classnames';
import type React from 'react';
import { useId } from 'react';

import styles from './Setting.module.css';

type Props = {
  children: React.ReactNode;
  'data-testid'?: string;
};

export function Section(props: Props) {
  return (
    <section
      className={styles.settingSection}
      data-testid={props['data-testid']}
    >
      {props.children}
    </section>
  );
}

export function Description(props: Props) {
  return (
    <p className={styles.settingDescription} data-testid={props['data-testid']}>
      {props.children}
    </p>
  );
}

export function Label(
  props: React.LabelHTMLAttributes<HTMLLabelElement> & {
    noMargin?: boolean;
    htmlFor: string;
  },
) {
  const { children, noMargin, htmlFor, ...restProps } = props;

  const classNames = cx(styles.settingLabel, {
    [styles.settingLabelNoMargin]: noMargin,
  });

  return (
    <label className={classNames} htmlFor={htmlFor} {...restProps}>
      {children}
    </label>
  );
}

export function Title(props: Props) {
  return (
    <h3 className={styles.settingTitle} data-testid={props['data-testid']}>
      {props.children}
    </h3>
  );
}

export type InputProps = {
  label: string;
  description?: string | React.ReactNode;
};

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & InputProps,
) {
  const { label, description, ...otherProps } = props;
  const id = useId();

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        className={styles.settingInput}
        autoComplete="off"
        {...otherProps}
      />
      {description != null && <Description>{description}</Description>}
    </div>
  );
}

export function ErrorMessage(props: Props) {
  return <p className={styles.settingError}>{props.children}</p>;
}

export function Select(
  props: Props & React.SelectHTMLAttributes<HTMLSelectElement> & InputProps,
) {
  const { label, description, ...otherProps } = props;
  const id = useId();

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select className={styles.settingSelect} id={id} {...otherProps}>
        {props.children}
      </select>
      {description != null && <Description>{description}</Description>}
    </div>
  );
}

export function ColorSelector(
  props: React.InputHTMLAttributes<HTMLInputElement> & InputProps,
) {
  const { label, description, ...otherProps } = props;
  const id = useId();

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        type="color"
        className={styles.settingInput}
        {...otherProps}
      />
      {description != null && <Description>{description}</Description>}
    </div>
  );
}
