import { type CSSProperties, useCallback, useEffect, useState } from 'react';

import cx from 'classnames';
import styles from './Focus.module.css';

/**
 * Show focus on keyboard navigation, hides it on mouse interaction
 */
export default function Focus() {
  const [location, setLocation] = useState<CSSProperties | undefined>(
    undefined,
  );

  const onFocus = useCallback(() => {
    const rectangle = document.activeElement?.getBoundingClientRect();

    if (rectangle === undefined) {
      return;
    }

    console.log(document.activeElement);

    setLocation({
      top: rectangle.top,
      left: rectangle.left,
      width: rectangle.width,
      height: rectangle.height,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('focusin', onFocus);

    return () => {
      return window.addEventListener('focusin', onFocus);
    };
  }, [onFocus]);

  const classNames = cx(styles.focus, {
    [styles.visible]: location !== undefined,
  });

  return <div className={classNames} style={location} />;
}
