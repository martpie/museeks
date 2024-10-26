import { NavLink } from 'react-router-dom';

import {
  Menu,
  MenuItem,
  type MenuItemOptions,
  PredefinedMenuItem,
  type PredefinedMenuItemOptions,
} from '@tauri-apps/api/menu';
import { useCallback, useState } from 'react';
import { logAndNotifyError } from '../../lib/utils';
import styles from './SideNavLink.module.css';

type Props = {
  label: string;
  id: string;
  href: string;
  onRename?: (id: string, name: string) => void;
  contextMenuItems?: Array<MenuItemOptions | PredefinedMenuItemOptions>;
};

export default function SideNavLink(props: Props) {
  const [renamed, setRenamed] = useState(false);

  const onContextMenu: React.MouseEventHandler<HTMLAnchorElement> = useCallback(
    async (event) => {
      if (!props.onRename && !props.contextMenuItems) {
        return;
      }

      event.preventDefault();

      const contextMenuItems = props.contextMenuItems ?? [];

      const menuItemsBuilders = contextMenuItems.map((item) => {
        if ('item' in item) {
          return PredefinedMenuItem.new(item);
        }

        return MenuItem.new(item);
      });

      const items = await Promise.all([
        MenuItem.new({
          text: 'Rename',
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
    [props.onRename, props.contextMenuItems],
  );

  const keyDown: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      e.persist();

      switch (e.nativeEvent.code) {
        case 'Enter': {
          // Enter
          if (renamed && e.currentTarget && props.onRename) {
            props.onRename(props.id, e.currentTarget.value);
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
    [props.onRename, props.id, renamed],
  );

  const onBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      if (renamed && props.onRename) {
        props.onRename(props.id, e.currentTarget.value);
      }

      setRenamed(false);
    },
    [props.onRename, props.id, renamed],
  );

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  }, []);

  return (
    <NavLink
      className={({ isActive }) =>
        `${styles.sideNavLink} ${isActive && 'isActive'}`
      }
      to={props.href}
      onContextMenu={onContextMenu}
      draggable={false}
    >
      {renamed ? (
        <input
          className={`${styles.sideNavLink} ${styles.sideNavLinkInput}`}
          type="text"
          defaultValue={props.label}
          onKeyDown={keyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          ref={(ref) => ref?.focus()}
        />
      ) : (
        props.label
      )}
    </NavLink>
  );
}
