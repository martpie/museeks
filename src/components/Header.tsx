import { lazy, Suspense } from 'react';

import styles from './Header.module.css';

const HeaderContent = lazy(() => import('./HeaderContent'));

export default function Header() {
  return (
    <header className={styles.header} data-tauri-drag-region>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderContent />
      </Suspense>
    </header>
  );
}

function HeaderSkeleton() {
  return (
    <>
      <div className={styles.headerMainControls} data-tauri-drag-region />
      <div className={styles.headerPlayingBar} data-tauri-drag-region />
      <div className={styles.headerSearch} data-tauri-drag-region />
    </>
  );
}
