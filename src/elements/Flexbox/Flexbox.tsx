import styles from './Flexbox.module.css';

type Props = {
  gap: 4 | 8 | 16;
  children: React.ReactNode;
};

export default function Flexbox(props: Props) {
  return (
    <div className={styles.flexbox} style={{ gap: props.gap }}>
      {props.children}
    </div>
  );
}
