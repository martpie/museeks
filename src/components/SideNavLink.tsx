import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { useLingui } from '@lingui/react/macro';
import * as stylex from '@stylexjs/stylex';
import {
  Link,
  type RegisteredRouter,
  type ValidateLinkOptions,
} from '@tanstack/react-router';
import {
  Menu,
  MenuItem,
  type MenuItemOptions,
  PredefinedMenuItem,
  type PredefinedMenuItemOptions,
} from '@tauri-apps/api/menu';
import { useState } from 'react';

import { logAndNotifyError } from '../lib/utils';

// *sigh* https://tanstack.com/router/latest/docs/framework/react/guide/type-utilities#type-checking-link-options-with-validatelinkoptions
interface Props<
  TRouter extends RegisteredRouter = RegisteredRouter,
  TOptions = unknown,
> {
  linkOptions: ValidateLinkOptions<TRouter, TOptions>;
  label: string;
  id: string;
  onRename?: (id: string, name: string) => void;
  contextMenuItems?: Array<MenuItemOptions | PredefinedMenuItemOptions>;
}

export type SideNavLinkProps = Props;

export default function SideNavLink<TRouter extends RegisteredRouter, TOptions>(
  props: Props<TRouter, TOptions>,
): React.ReactNode;
export default function SideNavLink(props: Props): React.ReactNode {
  const { t } = useLingui();
  const { label, id, onRename, contextMenuItems, linkOptions } = props;
  const [renamed, setRenamed] = useState(false);

  const onContextMenu: React.MouseEventHandler<HTMLAnchorElement> = async (
    event,
  ) => {
    if (!onRename && !contextMenuItems) {
      return;
    }

    event.preventDefault();

    const itemsBuilder = contextMenuItems ?? [];

    const menuItemsBuilders = itemsBuilder.map((item) => {
      if ('item' in item) {
        return PredefinedMenuItem.new(item);
      }

      return MenuItem.new(item);
    });

    const items = await Promise.all([
      MenuItem.new({
        text: t`Rename`,
        action: () => {
          setRenamed(true);
        },
      }),
      ...menuItemsBuilders,
    ]);

    const menu = await Menu.new({
      items,
    });

    await menu.popup().catch(logAndNotifyError);
  };

  const keyDown: React.KeyboardEventHandler<HTMLInputElement> = async (e) => {
    e.persist();

    switch (e.nativeEvent.code) {
      case 'Enter': {
        // Enter
        if (renamed && e.currentTarget && onRename) {
          onRename(id, e.currentTarget.value);
          setRenamed(false);
        }
        break;
      }
      case 'Escape': {
        // Escape
        setRenamed(false);
        break;
      }
      default: {
        break;
      }
    }
  };

  const onBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (renamed && onRename) {
      onRename(id, e.currentTarget.value);
    }

    setRenamed(false);
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  if (renamed) {
    return (
      <input
        type="text"
        defaultValue={label}
        onKeyDown={keyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        ref={(ref) => ref?.focus()}
        {...stylex.props(styles.sideNavLink, styles.sideNavLinkInput)}
      />
    );
  }

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link
        render={(renderProps) => (
          <Link
            {...renderProps}
            onContextMenu={onContextMenu}
            draggable={false}
            {...linkOptions}
            {...stylex.props(styles.sideNavLink)}
          >
            {label}
          </Link>
        )}
      />
    </NavigationMenu.Item>
  );
}

const styles = stylex.create({
  sideNavLink: {
    display: 'block',
    flexShrink: 0,
    width: '100%',
    lineHeight: 1,
    fontSize: '1rem',
    color: 'var(--text)',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: 'pointer',
    paddingBlock: '8px',
    paddingInline: '12px',
    textDecoration: 'none',
    backgroundColor: {
      default: 'transparent',
      ':hover': 'var(--sidebar-item-active-bg)',
      '[data-status="active"]': 'var(--active-item-bg)',
    },
  },
  sideNavLinkInput: {
    appearance: 'none',
    borderWidth: 0,
    backgroundColor: 'var(--sidebar-item-active-bg)',
    height: '28px' /* Problem with inputs? */,
  },
});
