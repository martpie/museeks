import { openPath, openUrl } from '@tauri-apps/plugin-opener';
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
      if (props.href.startsWith('http')) {
        openUrl(props.href);
      } else {
        openPath(props.href);
      }
    },
    [props.href],
  );

  return <Button onClick={openLink}>{props.children}</Button>;
}
