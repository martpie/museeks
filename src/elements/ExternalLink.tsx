import useOpener from '../hooks/useOpener';
import Link from './Link';

type Props = {
  children: string;
  href: string;
  type: 'filedir' | 'url';
};

export default function ExternalLink(props: Props) {
  const onClick = useOpener(props.href, props.type);

  return <Link onClick={onClick}>{props.children}</Link>;
}
