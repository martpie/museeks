import styles from './ExternalLink.module.css';

const { shell } = window.MuseeksAPI;

type Props = {
  children: string;
  href: string;
};

export default function ExternalLink(props: Props) {
  return (
    <button
      className={styles.externalLink}
      role="link"
      onClick={(e) => {
        e.preventDefault();
        shell.openExternal(props.href);
      }}
    >
      {props.children}
    </button>
  );
}
