const { test, expect } = require('@playwright/test');

const { countPixelsNearColor, decodeQrDownload } = require('../helpers/qr-decoder');

const FRAME_COLOR = { red: 255, green: 0, blue: 255 };

async function downloadArtifact(page) {
  const downloadButton = page.locator('#download-btn');
  await expect(downloadButton).toBeVisible({ timeout: 10_000 });
  await expect(downloadButton).toBeEnabled();

  const downloadPromise = page.waitForEvent('download');
  await downloadButton.click();
  return downloadPromise;
}

test('type pages open on their QR code type and link to the other generators', async ({ page }) => {
  await page.goto('/wifi-qr-code/');

  await expect(page.locator('#tab-Wifi')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#Wifi')).toBeVisible();
  await expect(page.locator('#URLText')).toBeHidden();
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('.type-links a[aria-current="page"]')).toHaveAttribute('href', '/wifi-qr-code/');

  await page.locator('#wifi-ssid').fill('Guest network');
  await page.locator('#wifi-password').fill('guestpass123');
  await expect(page.locator('#download-btn')).toBeVisible({ timeout: 10_000 });

  await page.locator('.type-links a[href="/vcard-qr-code/"]').click();
  await expect(page).toHaveURL(/\/vcard-qr-code\/$/);
  await expect(page.locator('#tab-VCard')).toHaveAttribute('aria-selected', 'true');
});

test('FAQ answers expand and the never-expires comparison is present', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#never-expires table')).toBeVisible();
  const firstQuestion = page.locator('.faq-item').first();
  await expect(firstQuestion.locator('p')).toBeHidden();
  await firstQuestion.locator('summary').click();
  await expect(firstQuestion.locator('p')).toBeVisible();
});

for (const format of ['png', 'svg']) {
  test(`framed ${format.toUpperCase()} downloads keep the QR code decodable @webkit-core`, async ({ page }) => {
    const payload = 'https://example.com/framed-qr';

    await page.goto('/');
    await page.locator('#qr-text').fill(payload);
    await page.locator('#size-select').selectOption('1024');
    await expect(page.locator('#frame-options')).toBeHidden();
    await page.locator('#frame-style').selectOption('banner-bottom');
    await expect(page.locator('#frame-options')).toBeVisible();
    await page.locator('#frame-text').fill('Menu & <prices>');
    await page.locator('#frame-color-text').fill('#FF00FF');
    if (format === 'svg') {
      await page.locator('#customize-toggle').click();
      await page.locator('#qr-format').selectOption('svg');
    }

    const decoded = await decodeQrDownload(page, await downloadArtifact(page));

    expect(decoded.filename).toMatch(new RegExp(`\\.${format}$`));
    expect(decoded.data).toBe(payload);
    expect(countPixelsNearColor(decoded.pixels, FRAME_COLOR, 8)).toBeGreaterThan(50_000);

    if (format === 'svg') {
      const svg = decoded.artifact.toString('utf8');
      expect(svg).toContain('viewBox="0 0 1024 1024"');
      expect(svg).toContain('Menu &amp; &lt;prices&gt;');
    } else {
      expect(decoded.artifact.readUInt32BE(16)).toBe(1024);
      expect(decoded.artifact.readUInt32BE(20)).toBe(1024);
    }
  });
}

test('frame settings reset with the other customizations', async ({ page }) => {
  await page.goto('/');
  await page.locator('#qr-text').fill('https://example.com/reset-frame');
  await page.locator('#frame-style').selectOption('outline');
  await page.locator('#frame-text').fill('Hello');
  await page.locator('#customize-toggle').click();

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#reset-customization').click();

  await expect(page.locator('#frame-style')).toHaveValue('none');
  await expect(page.locator('#frame-text')).toHaveValue('');
  await expect(page.locator('#frame-options')).toBeHidden();
});
