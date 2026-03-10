import { Progress } from '@base-ui/react/progress';
import * as stylex from '@stylexjs/stylex';

type Props = {
  progress?: number;
};

export default function ProgressBar(props: Props) {
  return (
    <Progress.Root
      value={props.progress ?? null}
      {...stylex.props(styles.progress)}
    >
      <Progress.Track {...stylex.props(styles.progressTrack)}>
        <Progress.Indicator
          {...stylex.props(styles.progressBar)}
          style={{ width: `${props.progress ?? 0}%` }}
        />
      </Progress.Track>
    </Progress.Root>
  );
}

const styles = stylex.create({
  progress: {
    flex: '1',
    display: 'block',
  },
  progressTrack: {
    height: '6px',
    backgroundColor: 'var(--progress-bg)',
  },
  progressBar: {
    height: '6px',
    backgroundColor: 'var(--main-color)',
    transition: 'width 0.2s ease-in-out',
  },
});
