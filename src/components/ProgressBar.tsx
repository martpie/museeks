import * as stylex from '@stylexjs/stylex';
import { Progress } from 'radix-ui';

type Props = {
  progress?: number;
};

export default function ProgressBar(props: Props) {
  return (
    <Progress.Root {...stylex.props(styles.progress)} value={props.progress}>
      <Progress.Indicator
        {...stylex.props(styles.progressBar)}
        style={{ width: `${props.progress}%` }}
      />
    </Progress.Root>
  );
}

const styles = stylex.create({
  progress: {
    flex: '1',
    display: 'block',
    height: '6px',
    backgroundColor: 'var(--progress-bg)',
  },
  progressBar: {
    height: '6px',
    backgroundColor: 'var(--main-color)',
    transition: 'width 0.2s ease-in-out',
  },
});
