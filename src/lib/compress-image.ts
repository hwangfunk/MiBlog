/**
 * Client-side image compression using Canvas API.
 * Resizes to max dimension and exports as WebP.
 * Zero dependencies — uses only browser-native APIs.
 */
export async function compressImage(
  file: File,
  maxDim = 1920,
  quality = 0.8
): Promise<File> {
  // Skip compression for small files
  if (file.size < 200 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally if exceeds max dimension
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        return reject(new Error('Failed to get canvas context'));
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));

          const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
          const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
          resolve(new File([blob], name, { type: blob.type }));
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}
