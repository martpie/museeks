import { useCallback } from 'react';
import { open } from '@tauri-apps/plugin-shell';

import Button from '../Button/Button';

type Props = {
  children: string;
  href: string;
};

export default function ExternalButton(props: Props) {
  const openLink = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      open(props.href);
    },
    [props.href],
  );

  return (
    <Button role="link" onClick={openLink}>
      {props.children}
    </Button>
  );
}
