import React from 'react';
import Scrollbars from 'rc-scrollbars';

import styles from './CustomScrollbar.module.css';

type Props = {
  children: React.ReactElement;
  className: string;
  onScroll: React.UIEventHandler<HTMLElement>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RenderView(props: any) {
  return <div {...props} className={styles.renderView} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TrackVertical(props: any) {
  return <div {...props} className={styles.verticalTrack} />;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ThumbVertical(props: any) {
  return <div {...props} className={styles.verticalThumb} />;
}

function CustomScrollbar(props: Props) {
  const { onScroll } = props;

  return (
    <Scrollbars
      className={props.className}
      renderView={RenderView}
      renderTrackVertical={TrackVertical}
      renderThumbVertical={ThumbVertical}
      autoHide
      autoHideTimeout={1000}
      onScroll={onScroll}
    >
      {props.children}
    </Scrollbars>
  );
}

export default CustomScrollbar;
