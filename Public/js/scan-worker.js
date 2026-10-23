// QRTurbo.app - Scan worker
// Runs in a dedicated Worker and decodes rendered previews with the vendored
// jsQR, which it loads on the first request. Protocol:
//   in:  { id, width, height, buffer: ArrayBuffer }  (RGBA, transferred)
//   out: { id, found: boolean, bytes: number[]|null }
// When jsQR cannot be loaded, the answer also carries unavailable: true, so
// the page can fall back to decoding on the main thread.
(function () {
    'use strict';

    if (typeof self === 'undefined' || typeof importScripts !== 'function') return;

    let decoder;

    /**
     * @description Loads jsQR once, with the same ?v= query as this worker,
     * so the service worker cache serves it offline. Returns null on failure.
     */
    function getDecoder() {
        if (decoder !== undefined) return decoder;
        try {
            importScripts('/js/vendor/jsqr.js' + self.location.search);
            decoder = typeof self.jsQR === 'function' ? self.jsQR : null;
        } catch (error) {
            decoder = null;
        }
        return decoder;
    }

    /**
     * @description Decodes one RGBA image and returns the raw payload bytes,
     * or null when no code was found.
     */
    function decodeImage(jsQR, message) {
        const width = Number(message.width);
        const height = Number(message.height);
        if (!(message.buffer instanceof ArrayBuffer) || !(width > 0) || !(height > 0)) return null;

        const data = new Uint8ClampedArray(message.buffer);
        if (data.length < width * height * 4) return null;

        const result = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
        return result && result.binaryData ? Array.from(result.binaryData) : null;
    }

    self.addEventListener('message', event => {
        const message = event.data || {};
        const jsQR = getDecoder();
        if (!jsQR) {
            self.postMessage({ id: message.id, found: false, bytes: null, unavailable: true });
            return;
        }

        let bytes = null;
        try {
            bytes = decodeImage(jsQR, message);
        } catch (error) {
            bytes = null;
        }
        self.postMessage({ id: message.id, found: bytes !== null, bytes });
    });
})();
