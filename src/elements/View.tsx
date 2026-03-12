import * as stylex from '@stylexjs/stylex';

import type SideNav from '../components/SideNav';

type Props = {
  children: React.ReactNode;
  sideNav?: React.ReactElement<typeof SideNav>;
  layout?: keyof typeof layoutVariants;
  hasPadding?: boolean;
  xstyle?: stylex.CompiledStyles;
};

/**
 * Default View to be used by all route components
 */
export default function View(props: Props) {
  const { layout = 'full-width' } = props;

  // Playlists or Artists pages
  if (props.sideNav) {
    return (
      <div
        {...stylex.props(
          styles.view,
          styles.viewWithSideNav,
          layoutVariants[layout],
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

  // Library or Settings pages
  return (
    <div
      {...stylex.props(
        styles.view,
        layoutVariants[layout],
        props.hasPadding && styles.hasPadding,
        props.xstyle,
      )}
    >
      {layout === 'centered' ? (
        <div {...stylex.props(styles.centeredContent)}>{props.children}</div>
      ) : (
        props.children
      )}
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
  centeredContent: {
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

const layoutVariants = stylex.create({
  'full-width': {},
  centered: {
    display: 'grid',
    gridTemplateColumns: '350px',
    justifyContent: 'center',
    scrollbarGutter: 'stable',
  },
});
