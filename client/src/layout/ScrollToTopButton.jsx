import { useEffect, useState } from 'react';
import { Button } from '@dataesr/react-dsfr';
import styles from './scroll-top.module.scss';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisibility = () => ((window.pageYOffset > 600)
      ? setIsVisible(true)
      : setIsVisible(false)
    );

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;
  return (
    <Button
      className={styles['scroll-top']}
      title="Revenir en haut de la page"
      size="lg"
      rounded
      icon="ri-arrow-up-line"
      onClick={scrollToTop}
    />

  );
}
