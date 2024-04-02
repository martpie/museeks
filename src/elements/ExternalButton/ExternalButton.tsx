import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

import Button from '../Button/Button';

type Props = {
  children: string;
  href: string;
};

export default function ExternalButton(props: Props) {
  const openLink = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      // TODO: replace this with @tauri-apps/plugin-shell's open when it's fixed
      // https://github.com/tauri-apps/tauri/issues/9349
      invoke('plugin:shell-extension|show_item_in_folder', {
        path: props.href,
      });
    },
    [props.href],
  );

  return (
    <Button role="link" onClick={openLink}>
      {props.children}
    </Button>
  );
}
