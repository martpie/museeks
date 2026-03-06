import * as stylex from '@stylexjs/stylex';

import type SideNav from '../components/SideNav';

type Props = {
  children: React.ReactNode;
  sideNav?: React.ReactElement<typeof SideNav>;
  layout?: 'centered';
  hasPadding?: boolean;
  xstyle?: stylex.CompiledStyles;
};

/**
 * Default View to be used by all route components
 */
export default function View(props: Props) {
  if (props.sideNav) {
    return (
      <div
        {...stylex.props(
          styles.view,
          styles.viewWithSideNav,
          props.layout === 'centered' && styles.centered,
        )}
      >
        {props.sideNav}
        <div
          {...stylex.props(
            styles.viewContent,
            props.hasPadding && styles.hasPadding,
            props.xstyle,
          )}
        >
          {props.children}
        </div>
      </div>
    );
  }

  if (props.layout === 'centered') {
    return (
      <div
        {...stylex.props(
          styles.view,
          styles.centered,
          props.hasPadding && styles.hasPadding,
          props.xstyle,
        )}
      >
        <div {...stylex.props(styles.centeredViewContent)}>
          {props.children}
        </div>
      </div>
    );
  }

  return (
    <div
      {...stylex.props(
        styles.view,
        props.hasPadding && styles.hasPadding,
        props.xstyle,
      )}
    >
      {props.children}
    </div>
  );
}

const styles = stylex.create({
  view: {
    height: '100%',
    maxHeight: '100%',
    backgroundColor: 'var(--background)',
    flex: '1 1 auto',
    overflow: 'auto',
    position: 'relative',
  },
  centered: {
    display: 'grid',
    gridTemplateColumns: '350px',
    justifyContent: 'center',
    scrollbarGutter: 'stable',
  },
  centeredViewContent: {
    position: 'relative',
  },
  hasPadding: {
    padding: '40px',
  },
  viewWithSideNav: {
    display: 'flex',
    overflow: 'hidden',
  },
  viewContent: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: 0,
  },
});
