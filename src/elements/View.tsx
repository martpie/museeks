import cx from 'classnames';

import type SideNav from '../components/SideNav';

import styles from './View.module.css';

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
  const viewClassNames = cx(styles.view, {
    [styles.viewWithSideNav]: props.sideNav,
    [styles.centered]: props.layout === 'centered',
  });

  const contentClassNames = cx(props.className, {
    [styles.hasPadding]: props.hasPadding,
  });

  if (props.sideNav) {
    return (
      <div className={viewClassNames}>
        {props.sideNav}
        <div className={`${contentClassNames} ${styles.viewContent}`}>
          {props.children}
        </div>
      </div>
    );
  }

  return (
    <div className={cx(viewClassNames, contentClassNames)}>
      {props.children}
    </div>
  );
}
