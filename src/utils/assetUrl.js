// Files in public/ are written as root-relative paths ('/assets/nova-logo.png') in the data and in Firestore.
// This prefixes the base path the site is served from (e.g. '/nova-ai/' on GitHub Pages); web links pass through unchanged.
export function assetUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}
