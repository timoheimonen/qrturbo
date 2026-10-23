const fs = require('node:fs/promises');

const { decodeQrBuffer } = require('../helpers/qr-decoder');
const {
  test,
  expect,
  openApp,
  readZip,
  translate
} = require('./fixtures');

function parseCsv(text) {
  return text.replace(/^﻿/, '').split('\r\n').filter(Boolean).map(line => line.split(','));
}

async function openBatch(page) {
  const open = page.locator('#batch-open-btn');
  await expect(open).toBeVisible();
  await open.click();
  await expect(page.locator('#batch-dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#batch-title')).toHaveText(await translate(page, 'batch.title'));
}

async function pasteRows(page, text, rows) {
  await page.locator('#batch-input').fill(text);
  await expect(page.locator('#batch-rows-found')).toHaveText(
    await translate(page, 'batch.rowsFound', { count: String(rows) })
  );
}

async function runBatch(page) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.locator('#batch-start').click()
  ]);
  const filePath = await download.path();
  return { filename: download.suggestedFilename(), entries: readZip(await fs.readFile(filePath)) };
}

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test('three pasted rows become a ZIP of three decodable PNGs and a manifest @webkit-core', async ({ page }) => {
  await openBatch(page);
  await pasteRows(page, [
    'url,name',
    'https://example.com/menu/lunch,Lunch menu',
    'https://example.com/menu/dinner,Dinner menu',
    'https://example.com/päivän-lista,Päivän lista'
  ].join('\n'), 3);
  await expect(page.locator('#batch-type')).toHaveValue('URLText');
  await expect(page.locator('#batch-has-header')).toBeChecked();
  await expect(page.locator('#batch-map-text')).toHaveValue('0');
  await page.locator('#batch-filename-col').selectOption('1');
  await page.locator('label[for="batch-format-png"]').click();
  await expect(page.locator('#batch-format-png')).toBeChecked();

  const zip = await runBatch(page);
  expect(zip.filename).toMatch(/^qrcodes-\d{4}-\d{2}-\d{2}\.zip$/);
  await expect(page.locator('#batch-status')).toHaveText(
    await translate(page, 'batch.done', { ok: '3', failed: '0' })
  );

  const names = zip.entries.map(entry => entry.name).sort();
  expect(names).toEqual(['Dinner menu.png', 'Lunch menu.png', 'Päivän lista.png', 'manifest.csv']);
  expect(zip.entries.find(entry => entry.name === 'Päivän lista.png').flags & 0x800).toBe(0x800);

  const expected = {
    'Lunch menu.png': 'https://example.com/menu/lunch',
    'Dinner menu.png': 'https://example.com/menu/dinner',
    'Päivän lista.png': 'https://example.com/päivän-lista'
  };
  for (const entry of zip.entries.filter(item => item.name.endsWith('.png'))) {
    expect(entry.data.readUInt32BE(16), `${entry.name} width`).toBe(1024);
    const decoded = await decodeQrBuffer(page, entry.data, 'image/png');
    expect(Buffer.from(decoded.binaryData).toString('utf8')).toBe(expected[entry.name]);
  }

  const manifestText = zip.entries.find(entry => entry.name === 'manifest.csv').data.toString('utf8');
  const manifest = parseCsv(manifestText);
  expect(manifest[0]).toEqual(['file', 'row', 'status', 'version', 'modules', 'scan', 'error']);
  expect(manifest.slice(1).map(row => [row[0], row[1], row[2]])).toEqual([
    ['Lunch menu.png', '2', 'ok'],
    ['Dinner menu.png', '3', 'ok'],
    ['Päivän lista.png', '4', 'ok']
  ]);
  // The manifest never repeats the encoded data.
  expect(manifestText).not.toContain('example.com');

  await page.locator('#batch-close').click();
  await expect(page.locator('#batch-dialog')).not.toHaveAttribute('open', '');
  await expect(page.locator('#batch-open-btn')).toBeFocused();
});

test('a bad row is skipped, listed with its row number and kept out of the ZIP', async ({ page }) => {
  await page.locator('#tab-Wifi').click();
  await openBatch(page);
  await expect(page.locator('#batch-type')).toHaveValue('Wifi');
  await pasteRows(page, ['ssid,password', 'Cafe Aalto,secret123', 'Guest,123', 'Office 2F,password99'].join('\n'), 3);
  await expect(page.locator('#batch-map-ssid')).toHaveValue('0');
  await expect(page.locator('#batch-map-password')).toHaveValue('1');

  const zip = await runBatch(page);
  await expect(page.locator('#batch-status')).toHaveText(
    await translate(page, 'batch.done', { ok: '2', failed: '1' })
  );
  const rowError = await translate(page, 'batch.rowError', {
    row: '3',
    message: await translate(page, 'alerts.wifiWpaPasswordInvalid')
  });
  await expect(page.locator('#batch-result')).toContainText(rowError);

  const pngs = zip.entries.filter(entry => entry.name.endsWith('.png'));
  expect(pngs.map(entry => entry.name).sort()).toEqual(['row-2.png', 'row-4.png']);
  const decoded = [];
  for (const entry of pngs) decoded.push((await decodeQrBuffer(page, entry.data, 'image/png')).data);
  expect(decoded.sort()).toEqual([
    'WIFI:S:Cafe Aalto;T:WPA;P:secret123;;',
    'WIFI:S:Office 2F;T:WPA;P:password99;;'
  ]);

  const manifestText = zip.entries.find(entry => entry.name === 'manifest.csv').data.toString('utf8');
  const skipped = parseCsv(manifestText).find(row => row[1] === '3');
  expect(skipped.slice(0, 3)).toEqual(['', '3', 'skipped']);
  expect(manifestText).not.toContain('secret123');
  expect(manifestText).not.toContain('password99');
});

test('Cancel stops the run and creates no ZIP', async ({ page }) => {
  await openBatch(page);
  // Enough rows that the run is still busy when Cancel is pressed.
  const rows = Array.from({ length: 200 }, (_, index) => `https://example.com/item/${index + 1}`);
  await pasteRows(page, ['url', ...rows].join('\n'), 200);

  let downloads = 0;
  page.on('download', () => {
    downloads += 1;
  });
  await page.locator('#batch-start').click();
  const cancel = page.locator('#batch-cancel');
  await expect(cancel).toBeVisible();
  await expect(page.locator('#batch-status')).toContainText(/\d/);
  await cancel.click();

  await expect(page.locator('#batch-status')).toHaveText(await translate(page, 'batch.cancelled'));
  await expect(cancel).toBeHidden();
  await expect(page.locator('#batch-start')).toBeVisible();
  expect(downloads).toBe(0);

  // A new run after a cancel works normally.
  await pasteRows(page, ['url', 'https://example.com/after-cancel'].join('\n'), 1);
  const zip = await runBatch(page);
  expect(zip.entries.map(entry => entry.name).sort()).toEqual(['manifest.csv', 'row-2.png']);
  expect(downloads).toBe(1);
});
