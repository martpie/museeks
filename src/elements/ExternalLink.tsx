import useOpener from '../hooks/useOpener';
import styles from './ExternalLink.module.css';

type Props = {
  children: string;
  href: string;
  type: 'filedir' | 'url';
};

export default function ExternalLink(props: Props) {
  const onClick = useOpener(props.href, props.type);

  return (
    <button type="button" className={styles.externalLink} onClick={onClick}>
      {props.children}
    </button>
  );
}
