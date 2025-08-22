import styles from './Scrollable.module.css';

type Props = {
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
};

export default function Scrollable(props: Props) {
  return (
    <div className={styles.scrollable} ref={props.ref}>
      {props.children}
    </div>
  );
}
