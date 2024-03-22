import { useEffect, useState } from 'react';

const useScroll = () => {
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const onScroll = (e) => {
      const scrollTopDocument = e.target.documentElement.scrollTop;
      setScrollTop(scrollTopDocument);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollTop]);

  return { scrollTop };
};

export default useScroll;
