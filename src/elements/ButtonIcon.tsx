import * as stylex from '@stylexjs/stylex';
import type React from 'react';

import Icon, { type IconName, type IconSize } from '../components/Icon';

type Props = React.ComponentPropsWithRef<'button'> & {
  icon: IconName;
  iconSize?: IconSize;
  isActive?: boolean;
  xstyle?: stylex.CompiledStyles;
  'data-testid'?: string;
};

export default function ButtonIcon(props: Props) {
  const {
    onClick,
    icon,
    iconSize,
    isActive,
    ref,
    xstyle,
    'data-testid': testId,
    ...rest
  } = props;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-museeks-action
      data-testid={testId}
      {...rest}
      {...stylex.props(styles.button, xstyle)}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={isActive ? 'var(--main-color)' : undefined}
        {...stylex.props(styles.icon)}
      />
    </button>
  );
}

const styles = stylex.create({
  button: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    borderWidth: '0',
    color: 'var(--text)',
    textAlign: 'center',
    padding: '0',
    lineHeight: 1,
  },
  icon: {
    verticalAlign: 'middle',
  },
});
