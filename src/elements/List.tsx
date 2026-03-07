import * as stylex from '@stylexjs/stylex';

type Props = {
  children: React.ReactNode;
};

export default function List(props: Props) {
  return <dl sx={styles.list}>{props.children}</dl>;
}

type ListItemProps = {
  label: string;
  content: string;
};

List.Item = function ListItem(props: ListItemProps) {
  return (
    <>
      <dt sx={styles.label}>{props.label}</dt>
      <dd sx={styles.content}>{props.content}</dd>
    </>
  );
};

const styles = stylex.create({
  list: {
    margin: '0',
    color: 'var(--text-muted)',
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    columnGap: '4px',
  },
  label: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    margin: '0',
  },
  content: {
    marginInlineStart: '0',
  },
});
