const fs = require('node:fs/promises');
const path = require('node:path');

const jsQR = require('jsqr');

const MIME_TYPES = {
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

async function rasterizeArtifact(page, artifact, mimeType) {
  return page.evaluate(async ({ base64, mimeType: type }) => {
    const bytes = Uint8Array.from(
      atob(base64),
      character => character.charCodeAt(0)
    );
    const objectUrl = URL.createObjectURL(new Blob([bytes], { type }));

    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`Could not rasterize ${type}`));
        image.src = objectUrl;
      });

      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (!width || !height) {
        throw new Error('Rasterized QR artifact has no dimensions');
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new Error('A 2D canvas context is required to decode QR artifacts');
      }

      // jsQR reads RGB values only, so composite transparent pixels onto white.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0);

      const pixels = context.getImageData(0, 0, width, height).data;
      let binary = '';
      for (let offset = 0; offset < pixels.length; offset += 0x8000) {
        binary += String.fromCharCode(...pixels.subarray(offset, offset + 0x8000));
      }

      return {
        width,
        height,
        rgbaBase64: btoa(binary)
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }, {
    base64: artifact.toString('base64'),
    mimeType
  });
}

async function decodeQrDownload(page, download) {
  const filename = download.suggestedFilename();
  const extension = path.extname(filename).toLowerCase();
  const mimeType = MIME_TYPES[extension];
  if (!mimeType) {
    throw new Error(`Unsupported QR artifact format: ${filename}`);
  }

  const downloadPath = await download.path();
  if (!downloadPath) {
    throw new Error(`Downloaded QR artifact has no local path: ${filename}`);
  }

  const artifact = await fs.readFile(downloadPath);
  const bitmap = await rasterizeArtifact(page, artifact, mimeType);
  const pixels = new Uint8ClampedArray(
    Buffer.from(bitmap.rgbaBase64, 'base64')
  );
  const decoded = jsQR(pixels, bitmap.width, bitmap.height, {
    inversionAttempts: 'attemptBoth'
  });

  if (!decoded) {
    throw new Error(`Independent QR decoder found no code in ${filename}`);
  }

  return {
    artifact,
    data: decoded.data,
    filename,
    pixels
  };
}

function countPixelsNearColor(pixels, color, tolerance = 0) {
  let matches = 0;

  for (let offset = 0; offset < pixels.length; offset += 4) {
    const alpha = pixels[offset + 3];
    if (
      alpha > 0
      && Math.abs(pixels[offset] - color.red) <= tolerance
      && Math.abs(pixels[offset + 1] - color.green) <= tolerance
      && Math.abs(pixels[offset + 2] - color.blue) <= tolerance
    ) {
      matches += 1;
    }
  }

  return matches;
}

module.exports = { countPixelsNearColor, decodeQrDownload };
