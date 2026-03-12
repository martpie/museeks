import * as stylex from '@stylexjs/stylex';

type Props = {
  children: React.ReactNode;
};

export default function DefinitionList(props: Props) {
  return <dl {...stylex.props(styles.list)}>{props.children}</dl>;
}

type ListItemProps = {
  label: string;
  content: string;
};

DefinitionList.Item = function DefinitionListItem(props: ListItemProps) {
  return (
    <>
      <dt {...stylex.props(styles.label)}>{props.label}</dt>
      <dd {...stylex.props(styles.content)}>{props.content}</dd>
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
