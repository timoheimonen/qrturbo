const fs = require('node:fs/promises');
const path = require('node:path');

const jsQR = require('jsqr');

const { rasterizeEps, rasterizePdf } = require('./vector-inspect');

// Raster and SVG artifacts are decoded in the browser. PDF and EPS files are
// rasterized in Node by tests/helpers/vector-inspect.js instead.
const MIME_TYPES = {
  '.eps': 'application/postscript',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const VECTOR_RASTERIZERS = {
  'application/pdf': rasterizePdf,
  'application/postscript': rasterizeEps
};

// jsQR misses some codes at one resolution and finds them at another, so
// vector files are tried at a few scales before giving up.
const VECTOR_PX_PER_PT = [3, 4, 2, 5, 6];

async function rasterizeArtifact(page, artifact, mimeType, { composite = true } = {}) {
  return page.evaluate(async ({ base64, mimeType: type, composite: onWhite }) => {
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

      // jsQR reads RGB values only, so composite transparent pixels onto
      // white unless the caller wants the raw pixels.
      if (onWhite) {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
      }
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
    base64: Buffer.from(artifact).toString('base64'),
    mimeType,
    composite
  });
}

function decodePixels(pixels, width, height) {
  return jsQR(pixels, width, height, { inversionAttempts: 'attemptBoth' });
}

function decodeVectorBuffer(buffer, rasterize) {
  let last = null;
  for (const pxPerPt of VECTOR_PX_PER_PT) {
    const raster = rasterize(Buffer.from(buffer), { pxPerPt });
    const pixels = new Uint8ClampedArray(raster.data);
    const decoded = decodePixels(pixels, raster.width, raster.height);
    last = { decoded, pixels, width: raster.width, height: raster.height };
    if (decoded) break;
  }

  return {
    data: last.decoded ? last.decoded.data : null,
    binaryData: last.decoded ? Uint8Array.from(last.decoded.binaryData) : null,
    width: last.width,
    height: last.height,
    pixels: last.pixels
  };
}

/**
 * Decodes an exported QR artifact with jsQR in Node. Images and SVG are
 * rasterized in the page; PDF and EPS are rasterized by vector-inspect (on
 * white, so composite does not apply to them). With composite: false image
 * pixels keep their alpha (transparent areas read as black), which lets
 * tests check backgrounds.
 */
async function decodeQrBuffer(page, buffer, mimeType, { composite = true } = {}) {
  const rasterizeVector = VECTOR_RASTERIZERS[mimeType];
  if (rasterizeVector) return decodeVectorBuffer(buffer, rasterizeVector);

  const bitmap = await rasterizeArtifact(page, buffer, mimeType, { composite });
  const pixels = new Uint8ClampedArray(
    Buffer.from(bitmap.rgbaBase64, 'base64')
  );
  const decoded = decodePixels(pixels, bitmap.width, bitmap.height);

  return {
    data: decoded ? decoded.data : null,
    binaryData: decoded ? Uint8Array.from(decoded.binaryData) : null,
    width: bitmap.width,
    height: bitmap.height,
    pixels
  };
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
  const decoded = await decodeQrBuffer(page, artifact, mimeType);

  if (decoded.data === null) {
    throw new Error(`Independent QR decoder found no code in ${filename}`);
  }

  return {
    artifact,
    data: decoded.data,
    filename,
    pixels: decoded.pixels
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

module.exports = { MIME_TYPES, countPixelsNearColor, decodeQrBuffer, decodeQrDownload };
