import { open } from '@tauri-apps/plugin-shell';
import { useCallback } from 'react';

import Button from './Button';

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

  return <Button onClick={openLink}>{props.children}</Button>;
}
