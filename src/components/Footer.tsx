import { lazy, Suspense } from 'react';

import styles from './Footer.module.css';

const FooterContent = lazy(() => import('./FooterContent'));

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Suspense fallback={<FooterSkeleton />}>
        <FooterContent />
      </Suspense>
    </footer>
  );
}

function FooterSkeleton() {
  return (
    <>
      <div className={styles.footerNavigation} />
      <div className={styles.footerStatus} />
    </>
  );
}
