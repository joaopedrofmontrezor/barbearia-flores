/**
 * Utility to compress images on the client side using HTML5 Canvas.
 * Reduces dimensions and quality to optimize uploads, save bandwidth,
 * and prevent database/localstorage quota bloat.
 * 
 * @param {File} file - The original image file
 * @param {number} maxWidth - Maximum width of the compressed image
 * @param {number} maxHeight - Maximum height of the compressed image
 * @param {number} quality - Image quality from 0.0 to 1.0 (JPEG/WEBP)
 * @returns {Promise<File>} - A promise that resolves with the compressed File
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    // If it's not a browser environment or not an image file, skip compression
    if (typeof window === 'undefined' || !file || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image into canvas (browser automatically performs downsampling)
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to blob with target quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Construct a new File object representing the compressed image
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            console.log(
              `[ImageCompressor] Compressed "${file.name}" from ${(file.size / 1024).toFixed(1)}KB to ${(compressedFile.size / 1024).toFixed(1)}KB (${(((file.size - compressedFile.size) / file.size) * 100).toFixed(0)}% reduction)`
            );
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = (err) => {
        console.warn("[ImageCompressor] Failed to load image element, using original file", err);
        resolve(file);
      };
    };

    reader.onerror = (err) => {
      console.warn("[ImageCompressor] Failed to read file, using original file", err);
      resolve(file);
    };
  });
};
