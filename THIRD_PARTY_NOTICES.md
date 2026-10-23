# Third-Party Notices

QRTurbo.app includes the following third-party software. Each component
remains subject to its own license terms and copyright notice.

## qr-code-styling

Source: https://github.com/kozakdenys/qr-code-styling

MIT License

Copyright (c) 2019 Denys Kozak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## qrcode-generator

Source: https://github.com/kazuhikoarase/qrcode-generator

MIT License

Copyright (c) 2009 Kazuhiko Arase

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## jsQR

jsQR 1.4.0, Cosmo Wolfe and contributors, https://github.com/cozmo/jsQR,
Apache License 2.0

Included unmodified as `Public/js/vendor/jsqr.js`. It runs in the browser
to test-scan the QR codes that QRTurbo.app creates. The full license text is
in `Public/js/vendor/jsqr.LICENSE.txt`, which is published next to the script.

## Helvetica-Bold font metrics (Adobe Core14 AFM)

Helvetica-Bold character widths from `Helvetica-Bold.afm` (Version 002.000,
UniqueID 43052) in Adobe's Core14 AFM files (Core14_AFMs), Adobe Systems
Incorporated.

Used in `Public/js/lib/helvetica.js` to measure frame labels, so they stay
live text in PDF and EPS exports. No font program is included.

Modification: only the advance widths (WX) of the WinAnsiEncoding codes
U+0020-U+007E and U+00A0-U+00FF are kept, as a table of numbers; all other
AFM data (kerning, bounding boxes, ligatures) is left out.

Copyright (c) 1985, 1987, 1989, 1990, 1997 Adobe Systems Incorporated. All
Rights Reserved. Helvetica is a trademark of Linotype-Hell AG and/or its
subsidiaries.

The Core14 AFM license notice:

This file and the 14 PostScript(R) AFM files it accompanies may be used,
copied, and distributed for any purpose and without charge, with or without
modification, provided that all copyright notices are retained; that the AFM
files are not distributed without this file; that all modifications to this
file or any of the AFM files are prominently noted in the modified file(s);
and that this paragraph is not modified. Adobe Systems has no responsibility
or obligation to support the use of the AFM files.
