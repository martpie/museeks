import * as stylex from '@stylexjs/stylex';
import type React from 'react';
import { useId } from 'react';

type Props = {
  children: React.ReactNode;
  'data-testid'?: string;
};

export function Section(props: Props) {
  return (
    <section
      data-testid={props['data-testid']}
      {...stylex.props(styles.settingSection)}
    >
      {props.children}
    </section>
  );
}

export function Description(props: Props) {
  return (
    <p
      data-testid={props['data-testid']}
      {...stylex.props(styles.settingDescription)}
    >
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

  return (
    <label
      htmlFor={htmlFor}
      {...restProps}
      {...stylex.props(
        styles.settingLabel,
        noMargin && styles.settingLabelNoMargin,
      )}
    >
      {children}
    </label>
  );
}

export function Title(props: Props) {
  return (
    <h3
      data-testid={props['data-testid']}
      {...stylex.props(styles.settingTitle)}
    >
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
        autoComplete="off"
        {...otherProps}
        {...stylex.props(styles.settingInput)}
      />
      {description != null && <Description>{description}</Description>}
    </div>
  );
}

export function ErrorMessage(props: Props) {
  return <p {...stylex.props(styles.settingError)}>{props.children}</p>;
}

export function Select(
  props: Props & React.SelectHTMLAttributes<HTMLSelectElement> & InputProps,
) {
  const { label, description, ...otherProps } = props;
  const id = useId();

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} {...otherProps} {...stylex.props(styles.settingSelect)}>
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
        {...otherProps}
        {...stylex.props(styles.settingInput, styles.settingColorInput)}
      />
      {description != null && <Description>{description}</Description>}
    </div>
  );
}

const styles = stylex.create({
  settingSection: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  settingTitle: {
    display: 'block',
    margin: 0,
  },
  settingDescription: {
    fontWeight: 'normal',
    marginTop: '5px',
    marginBottom: '4px',
    color: 'var(--text-muted)',
  },
  settingLabel: {
    display: 'inline-block',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  settingLabelNoMargin: {
    marginBottom: 0,
  },
  settingSelect: {
    appearance: 'none',
    display: 'block',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--input-color)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--border-color-softer)',
      ':focus': 'var(--main-color)',
    },
    borderRadius: 'var(--border-radius)',
    padding: '8px',
    width: '100%',
    fontSize: '1rem',
    opacity: {
      ':disabled': 0.6,
    },
    cursor: {
      ':disabled': 'not-allowed',
    },
  },
  settingInput: {
    appearance: 'none',
    display: 'block',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--input-color)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: {
      default: 'var(--border-color-softer)',
      ':focus': 'var(--main-color)',
    },
    borderRadius: 'var(--border-radius)',
    padding: '8px',
    width: '100%',
    fontSize: '1rem',
    opacity: {
      ':disabled': 0.6,
    },
    cursor: {
      ':disabled': 'not-allowed',
    },
  },
  settingColorInput: {
    padding: 0,
    width: '80px',
  },
  settingError: {
    color: 'red',
  },
});
