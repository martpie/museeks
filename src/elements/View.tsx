import * as stylex from '@stylexjs/stylex';

import type SideNav from '../components/SideNav';

type Props = {
  children: React.ReactNode;
  sideNav?: React.ReactElement<typeof SideNav>;
  layout?: 'centered';
  hasPadding?: boolean;
  className?: string;
};

/**
 * Default View to be used by all route components
 */
export default function View(props: Props) {
  const viewClassName = stylex.props(
    styles.view,
    props.sideNav && styles.viewWithSideNav,
    props.layout === 'centered' && styles.centered,
  ).className;

  const contentClassName = joinClassNames(
    stylex.props(props.hasPadding && styles.hasPadding).className,
    props.className,
  );

  const viewAndContentClassName = joinClassNames(
    viewClassName,
    contentClassName,
  );

  if (props.sideNav) {
    return (
      <div className={viewClassName}>
        {props.sideNav}
        <div
          className={joinClassNames(
            contentClassName,
            stylex.props(styles.viewContent).className,
          )}
        >
          {props.children}
        </div>
      </div>
    );
  }

  if (props.layout === 'centered') {
    return (
      <div className={viewAndContentClassName}>
        <div {...stylex.props(styles.centeredViewContent)}>
          {props.children}
        </div>
      </div>
    );
  }

  return <div className={viewAndContentClassName}>{props.children}</div>;
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
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
    flex: '1',
  },
});
