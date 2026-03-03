import * as stylex from '@stylexjs/stylex';

type Props = {
  children: React.ReactNode;
  ref: React.Ref<HTMLDivElement>;
};

export default function Scrollable(props: Props) {
  return (
    <div {...stylex.props(styles.scrollable)} ref={props.ref}>
      {props.children}
    </div>
  );
}

const styles = stylex.create({
  scrollable: {
    overflowY: 'auto',
  },
});
