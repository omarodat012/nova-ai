import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Scrolls to the #section in the URL, or back to the top when the route changes.
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    const samePage = previousPathname.current === pathname;
    previousPathname.current = pathname;

    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: samePage ? 'smooth' : 'instant' });
    }
  }, [pathname, hash, key]);

  return null;
}
