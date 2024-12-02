import { useEffect, useState } from 'react';

export default function useCopyToClipboard(resetTimeout = 1500) {
  const [copyStatus, setCopyStatus] = useState(null);

  async function copyToClipboard(text) {
    if ('clipboard' in navigator) return navigator.clipboard.writeText(text);
    return document.execCommand('copy', true, text);
  }

  const copy = (text) => {
    copyToClipboard(text)
      .then(() => { setCopyStatus('Copié'); })
      .catch(() => { setCopyStatus('Erreur'); });
  };
  useEffect(() => {
    let timeoutId;
    if (copyStatus) {
      timeoutId = setTimeout(() => setCopyStatus(null), resetTimeout);
    }
    return () => clearTimeout(timeoutId);
  }, [copyStatus, resetTimeout]);

  return [copyStatus, copy];
}
