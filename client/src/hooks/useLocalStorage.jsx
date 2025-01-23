import { useCallback, useEffect, useState } from 'react';

export default function useLocalStorage(key, defaultValue) {
  const readValue = () => {
    const storedString = localStorage.getItem(key);

    if (storedString === null && defaultValue !== null) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return readValue();
    }
    return JSON.parse(storedString);
  };
  const [storedValue, setStoredValue] = useState(() => readValue());

  const setValue = useCallback((newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
    window.dispatchEvent(new StorageEvent('works-magnet-locale', { key }));
  }, [key]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) {
        setStoredValue(readValue());
      }
    };
    window.addEventListener('works-magnet-locale', handleStorage);
    return () => {
      window.removeEventListener('works-magnet-locale', handleStorage);
    };
  });

  return [storedValue, setValue];
}
