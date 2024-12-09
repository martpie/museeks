import useOpener from '../hooks/useOpener';
import Button from './Button';

type Props = {
  children: string;
  href: string;
  type: 'filedir' | 'url';
};

export default function ExternalButton(props: Props) {
  const onClick = useOpener(props.href, props.type);

  return <Button onClick={onClick}>{props.children}</Button>;
}
