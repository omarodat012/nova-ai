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
