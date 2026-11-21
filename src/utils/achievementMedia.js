import galleries from 'virtual:achievement-galleries';

// Where the event photo folders live, relative to public/.
export const GALLERIES_PATH = '/assets/achievements';

const WEB_URL = /^https?:\/\/\S+$/i;
const IMAGE_FILE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
const COVER_FILE = /\/cover\.[^/.]+$/i;

// Detected folders as [{ folder, path, photos }], for the 1-click chips in the admin form.
export const detectedGalleries = Object.entries(galleries).map(([folder, photos]) => ({
  folder,
  path: `${GALLERIES_PATH}/${folder}`,
  photos,
}));

// 'zaka-event', '/assets/achievements/zaka-event/' and 'public\assets\achievements\zaka-event' all become 'zaka-event'.
function toFolderKey(source) {
  let folder = source.trim().replace(/\\/g, '/');
  try {
    folder = decodeURIComponent(folder);
  } catch {
    // Not percent-encoded; use it as typed.
  }
  return folder
    .replace(/^\/+/, '')
    .replace(/^public\//i, '')
    .replace(/^assets\/achievements(\/|$)/i, '')
    .replace(/\/+$/, '');
}

function findGallery(source) {
  const key = toFolderKey(source).toLowerCase();
  return detectedGalleries.find((gallery) => gallery.folder.toLowerCase() === key) ?? null;
}

// Classifies what an admin typed into the "Photos Folder Path" field:
// { kind: 'none' | 'image' | 'folder' | 'invalid', value, photos }, where `value` is the form to store.
export function resolvePhotoSource(source) {
  const text = (source ?? '').trim();
  if (!text) return { kind: 'none', value: null, photos: [] };
  if (WEB_URL.test(text)) return { kind: 'image', value: text, photos: [] };

  const gallery = findGallery(text);
  if (gallery) return { kind: 'folder', value: gallery.path, photos: gallery.photos };
  // A single file shipped in public/, e.g. /assets/event.jpg.
  if (text.startsWith('/') && IMAGE_FILE.test(text)) return { kind: 'image', value: text, photos: [] };

  const folder = toFolderKey(text);
  if (!folder || folder.includes(':') || folder.split('/').includes('..')) {
    return { kind: 'invalid', value: null, photos: [] };
  }
  // A folder that has no photos yet (or is not part of this build).
  return { kind: 'folder', value: `${GALLERIES_PATH}/${folder}`, photos: [] };
}

// `achievement.image` holds either a photos folder or a single image.
// Returns the card cover (cover.* if the folder has one, otherwise its first photo) and the gallery photos.
export function getAchievementMedia(achievement) {
  const { kind, value, photos } = resolvePhotoSource(achievement.image);
  if (kind === 'image') return { cover: value, photos: [] };
  return { cover: photos.find((url) => COVER_FILE.test(url)) ?? photos[0] ?? null, photos };
}
