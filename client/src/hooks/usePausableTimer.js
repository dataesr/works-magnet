import { useState, useEffect, useRef } from 'react';

export default function usePausableTimer(callback, delay) {
  const [paused, setPaused] = useState(false);
  const start = useRef(new Date());
  const remaining = useRef(delay);
  const timeoutId = useRef(null);

  const clear = () => clearTimeout(timeoutId.current);

  const pause = () => {
    setPaused(true);
    remaining.current -= (new Date() - start.current);
    clear();
  };

  const resume = () => {
    start.current = new Date();
    setPaused(false);
  };

  // Set up the interval.
  useEffect(() => {
    if (!paused && delay) {
      timeoutId.current = setTimeout(callback, remaining.current);
    }
    return clear;
  }, [remaining, paused, delay, callback]);
  return { paused, pause, resume };
}
