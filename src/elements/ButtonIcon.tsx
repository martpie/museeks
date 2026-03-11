import * as stylex from '@stylexjs/stylex';
import type React from 'react';

import Icon, { type IconName, type IconSize } from '../components/Icon';

type Props = React.ComponentPropsWithRef<'button'> & {
  icon: IconName;
  iconSize?: IconSize;
  isActive?: boolean;
  xstyle?: stylex.CompiledStyles;
};

export default function ButtonIcon(props: Props) {
  const { onClick, icon, iconSize, isActive, ref, xstyle, ...rest } = props;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-museeks-action
      {...rest}
      {...stylex.props(styles.buttonIcon, xstyle)}
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
  buttonIcon: {
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
