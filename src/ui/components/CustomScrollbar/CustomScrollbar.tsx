import React, { useCallback } from 'react';
import Scrollbars from 'rc-scrollbars';

import styles from './CustomScrollbar.module.css';

interface Props {
  className: string;
  onScroll: React.UIEventHandler<HTMLElement>;
}

const CustomScrollbar: React.FC<Props> = (props) => {
  const { onScroll } = props;

  const getRenderView = useCallback((props: any) => {
    return <div {...props} className={styles.renderView} />;
  }, []);

  const getTrackVertical = useCallback((props: any) => {
    return <div {...props} className={styles.verticalTrack} />;
  }, []);

  const getThumbVertical = useCallback((props: any) => {
    return <div {...props} className={styles.verticalThumb} />;
  }, []);

  return (
    <Scrollbars
      // eslint-disable-next-line
      // @ts-ignore
      className={props.className}
      renderView={getRenderView}
      renderTrackVertical={getTrackVertical}
      renderThumbVertical={getThumbVertical}
      autoHide
      autoHideTimeout={1000}
      onScroll={onScroll}
    >
      {props.children}
    </Scrollbars>
  );
};

export default CustomScrollbar;
