const MAX_SIDE = 256;
const QUALITY = 0.8;
// A 256px JPEG is normally 10-30 KB. firestore.rules rejects a photoURL above 100,000 characters.
const MAX_DATA_URL_LENGTH = 80000;
// Painted behind transparent PNGs, which JPEG would otherwise turn black.
const BACKDROP = '#16132b';

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable image'));
    };
    image.src = url;
  });
}

// Turns a picked image file into a small square avatar: centre-cropped, at most 256x256, as a JPEG data URL.
// Rejects when the file is not an image the browser can decode.
export async function resizeImageToDataUrl(file) {
  const image = await loadImage(file);
  const crop = Math.min(image.naturalWidth, image.naturalHeight);
  if (!crop) throw new Error('empty image');

  const side = Math.min(MAX_SIDE, crop);
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;

  const context = canvas.getContext('2d');
  context.fillStyle = BACKDROP;
  context.fillRect(0, 0, side, side);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, (image.naturalWidth - crop) / 2, (image.naturalHeight - crop) / 2, crop, crop, 0, 0, side, side);

  let quality = QUALITY;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.4) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }
  if (dataUrl.length > MAX_DATA_URL_LENGTH) throw new Error('image too large');
  return dataUrl;
}

const BANNER_MAX_WIDTH = 800;
const BANNER_MAX_HEIGHT = 1200;
// About 150 KB of image once base64 adds a third. firestore.rules rejects a status imageData above 210,000 characters.
const BANNER_MAX_DATA_URL_LENGTH = 200000;

// Turns a picked image file into a compressed JPEG data URL that keeps its proportions: at most 800px wide.
// Quality drops first, then the size, until it fits. Rejects when the file cannot be decoded or still does not fit.
export async function compressImageToDataUrl(file) {
  const image = await loadImage(file);
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight) throw new Error('empty image');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  let scale = Math.min(1, BANNER_MAX_WIDTH / naturalWidth, BANNER_MAX_HEIGHT / naturalHeight);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    canvas.width = Math.max(1, Math.round(naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(naturalHeight * scale));
    context.fillStyle = BACKDROP;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (let quality = QUALITY; quality > 0.45; quality -= 0.1) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (dataUrl.length <= BANNER_MAX_DATA_URL_LENGTH) return dataUrl;
    }
    scale *= 0.8;
  }
  throw new Error('image too large');
}
