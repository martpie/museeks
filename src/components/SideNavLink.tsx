import { useLingui } from '@lingui/react/macro';
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
import { useCallback, useState } from 'react';

import { logAndNotifyError } from '../lib/utils';
import styles from './SideNavLink.module.css';

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

  const onContextMenu: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    async (event) => {
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
    },
    [onRename, contextMenuItems, t],
  );

  const keyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
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
    },
    [onRename, id, renamed],
  );

  const onBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      if (renamed && onRename) {
        onRename(id, e.currentTarget.value);
      }

      setRenamed(false);
    },
    [onRename, id, renamed],
  );

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  if (renamed) {
    return (
      <input
        className={`${styles.sideNavLink} ${styles.sideNavLinkInput}`}
        type="text"
        defaultValue={label}
        onKeyDown={keyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        ref={(ref) => ref?.focus()}
      />
    );
  }

  return (
    <Link
      className={styles.sideNavLink}
      activeProps={{ className: styles.isActive }}
      onContextMenu={onContextMenu}
      draggable={false}
      {...linkOptions}
    >
      {label}
    </Link>
  );
}
