import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../../utils/assetUrl.js';

// Renders an image from public/assets and swaps to `fallback` if the file is missing or broken.
export default function SmartImage({ src, alt = '', fallback = null, className = '', ...rest }) {
  const [status, setStatus] = useState('loading');
  const imageRef = useRef(null);

  useEffect(() => {
    // Covers images that finished (or failed) before React attached the handlers.
    const image = imageRef.current;
    if (image?.complete) setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
  }, []);

  if (status === 'error') return fallback;

  return (
    <img
      ref={imageRef}
      src={assetUrl(src)}
      alt={alt}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
      className={`${className} transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
      {...rest}
    />
  );
}
