import styles from './List.module.css';

type Props = {
  children: React.ReactNode;
};

export default function List(props: Props) {
  return <dl className={styles.list}>{props.children}</dl>;
}

type ListItemProps = {
  label: string;
  content: string;
};

List.Item = function ListItem(props: ListItemProps) {
  return (
    <>
      <dt className={styles.label}>{props.label}</dt>
      <dd className={styles.content}>{props.content}</dd>
    </>
  );
};
