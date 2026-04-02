import { Progress } from '@base-ui/react/progress';
import * as stylex from '@stylexjs/stylex';

type Props = {
  progress?: number;
  label: string;
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
      <Progress.Label {...stylex.props(styles.progressLabel)}>
        {props.label}
      </Progress.Label>
    </Progress.Root>
  );
}

const styles = stylex.create({
  progress: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  progressTrack: {
    flexGrow: 1,
    height: '6px',
    backgroundColor: 'var(--progress-bg)',
  },
  progressBar: {
    height: '6px',
    backgroundColor: 'var(--main-color)',
    transition: 'width 0.2s ease-in-out',
  },
  progressLabel: {
    flexShrink: 0,
    fontSize: '12px',
    color: 'var(--text-color)',
    fontVariantNumeric: 'tabular-nums',
  },
});
