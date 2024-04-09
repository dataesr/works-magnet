import { useEffect, useState } from 'react';

const useScroll = () => {
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollTop(document.documentElement.scrollTop || document.body.scrollTop);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTop]);
  return { scrollTop };
};

export default useScroll;
