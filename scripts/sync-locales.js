#!/usr/bin/env node
// Keeps every runtime locale in Public/js/i18n/locales/ in step with the
// English strings in Public/js/i18n/core.js.
//
//   node scripts/sync-locales.js                    add missing keys, drop unknown keys
//   node scripts/sync-locales.js --reset a.b,c.d    also reset these keys to English
//
// Each locale file ends up with exactly the English key set, in the English
// order. A missing key gets the English text as a placeholder until a
// translator replaces it. Existing entries keep their original source text,
// so translations and line wrapping are untouched; only new or reset entries
// are written fresh.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const i18nDir = path.join(repoRoot, 'Public/js/i18n');
const localeDir = path.join(i18nDir, 'locales');
const PRINT_WIDTH = 120;
const INDENT = '  ';

function loadEnglish() {
  const noop = () => {};
  const context = {
    window: {},
    document: {
      readyState: 'loading',
      currentScript: null,
      addEventListener: noop,
      documentElement: { getAttribute: () => 'en' }
    },
    console
  };
  context.window.window = context.window;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(i18nDir, 'core.js'), 'utf8'), context, { filename: 'core.js' });
  return context.window.translations.en;
}

function evaluateLocale(source, lang, filename) {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(source, context, { filename });
  const value = context.window.translations && context.window.translations[lang];
  if (!value || typeof value !== 'object') {
    throw new Error(`${filename} does not register window.translations[${JSON.stringify(lang)}]`);
  }
  return value;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function flattenKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, nested]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    return isPlainObject(nested) ? flattenKeys(nested, next) : [next];
  });
}

// A small parser for the locale object literal. It records where every
// property starts and ends, so unchanged entries can be copied verbatim.
function parseObjectLiteral(source, start) {
  let pos = start;

  function fail(message) {
    const line = source.slice(0, pos).split('\n').length;
    throw new Error(`${message} at line ${line}`);
  }

  function skipTrivia() {
    for (;;) {
      while (pos < source.length && /\s/.test(source[pos])) pos += 1;
      if (source.startsWith('//', pos)) {
        const end = source.indexOf('\n', pos);
        pos = end < 0 ? source.length : end + 1;
      } else if (source.startsWith('/*', pos)) {
        const end = source.indexOf('*/', pos + 2);
        if (end < 0) fail('Unterminated comment');
        pos = end + 2;
      } else {
        return;
      }
    }
  }

  function readString() {
    const quote = source[pos];
    let cursor = pos + 1;
    while (cursor < source.length && source[cursor] !== quote) {
      if (source[cursor] === '\\') cursor += 1;
      if (source[cursor] === '\n') fail('Line break inside a string');
      cursor += 1;
    }
    if (cursor >= source.length) fail('Unterminated string');
    const raw = source.slice(pos, cursor + 1);
    pos = cursor + 1;
    return raw;
  }

  function readKey() {
    if (source[pos] === "'" || source[pos] === '"') {
      return vm.runInNewContext(readString());
    }
    const match = /^[A-Za-z_$][\w$]*/.exec(source.slice(pos));
    if (!match) fail('Expected a property name');
    pos += match[0].length;
    return match[0];
  }

  function readObject() {
    if (source[pos] !== '{') fail('Expected {');
    pos += 1;
    const entries = new Map();
    skipTrivia();
    while (source[pos] !== '}') {
      const entryStart = pos;
      const key = readKey();
      skipTrivia();
      if (source[pos] !== ':') fail(`Expected : after ${key}`);
      pos += 1;
      skipTrivia();
      let value;
      if (source[pos] === '{') {
        value = { kind: 'object', entries: readObject() };
      } else if (source[pos] === "'" || source[pos] === '"') {
        readString();
        value = { kind: 'string' };
      } else {
        fail(`Unsupported value for ${key}`);
      }
      value.raw = source.slice(entryStart, pos);
      entries.set(key, value);
      skipTrivia();
      if (source[pos] === ',') {
        pos += 1;
        skipTrivia();
      } else if (source[pos] !== '}') {
        fail(`Expected , or } after ${key}`);
      }
    }
    pos += 1;
    return entries;
  }

  const entries = readObject();
  return { entries, end: pos };
}

function quote(text) {
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return `'${escaped}'`;
}

function formatKey(key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : quote(key);
}

// New entries follow the existing style: one line when it fits in
// PRINT_WIDTH, otherwise the value moves to its own, further indented line.
function formatLeaf(key, value, indent) {
  const oneLine = `${indent}${formatKey(key)}: ${quote(value)},`;
  if (oneLine.length <= PRINT_WIDTH) {
    return `${formatKey(key)}: ${quote(value)}`;
  }
  return `${formatKey(key)}:\n${indent}${INDENT}${quote(value)}`;
}

function renderObject(english, parsed, localeValue, prefix, depth, resetKeys, stats) {
  const indent = INDENT.repeat(depth + 1);
  const lines = Object.entries(english).map(([key, englishValue]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const parsedEntry = parsed ? parsed.get(key) : undefined;
    const localeEntry = isPlainObject(localeValue) ? localeValue[key] : undefined;

    if (isPlainObject(englishValue)) {
      const nestedParsed = parsedEntry && parsedEntry.kind === 'object' ? parsedEntry.entries : null;
      const body = renderObject(englishValue, nestedParsed, localeEntry, fullKey, depth + 1, resetKeys, stats);
      return `${indent}${formatKey(key)}: ${body}`;
    }

    const hasTranslation = parsedEntry && parsedEntry.kind === 'string' && typeof localeEntry === 'string';
    if (hasTranslation && !resetKeys.has(fullKey)) {
      return `${indent}${parsedEntry.raw}`;
    }
    if (hasTranslation) {
      stats.reset.push(fullKey);
    } else {
      stats.added.push(fullKey);
    }
    return `${indent}${formatLeaf(key, englishValue, indent)}`;
  });
  return `{\n${lines.join(',\n')}\n${INDENT.repeat(depth)}}`;
}

function buildExpected(english, localeValue, prefix, resetKeys) {
  return Object.fromEntries(Object.entries(english).map(([key, englishValue]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const localeEntry = isPlainObject(localeValue) ? localeValue[key] : undefined;
    if (isPlainObject(englishValue)) {
      return [key, buildExpected(englishValue, localeEntry, fullKey, resetKeys)];
    }
    const keep = typeof localeEntry === 'string' && !resetKeys.has(fullKey);
    return [key, keep ? localeEntry : englishValue];
  }));
}

function syncLocale(file, english, resetKeys) {
  const lang = path.basename(file, '.js');
  const source = fs.readFileSync(file, 'utf8');
  const localeValue = evaluateLocale(source, lang, path.basename(file));

  const assignment = /window\.translations(?:\.([A-Za-z_$][\w$]*)|\[\s*'([^']+)'\s*\])\s*=\s*(?=\{)/.exec(source);
  if (!assignment || (assignment[1] || assignment[2]) !== lang) {
    throw new Error(`${path.basename(file)}: could not find the window.translations.${lang} assignment`);
  }
  const objectStart = assignment.index + assignment[0].length;
  const { entries, end } = parseObjectLiteral(source, objectStart);

  // The object sits one level inside the IIFE, so nested keys start at depth 1.
  const stats = { added: [], reset: [], removed: [] };
  const englishKeys = new Set(flattenKeys(english));
  stats.removed = flattenKeys(localeValue).filter(key => !englishKeys.has(key));
  const body = renderObject(english, entries, localeValue, '', 1, resetKeys, stats);
  const output = `${source.slice(0, objectStart)}${body}${source.slice(end)}`;

  // Re-evaluate the result: it must load and hold exactly the expected values.
  const written = evaluateLocale(output, lang, path.basename(file));
  const expected = buildExpected(english, localeValue, '', resetKeys);
  if (JSON.stringify(written) !== JSON.stringify(expected)) {
    throw new Error(`${path.basename(file)}: the rewritten file does not hold the expected strings`);
  }

  if (output !== source) {
    fs.writeFileSync(file, output);
  }
  return { lang, changed: output !== source, ...stats };
}

function parseResetKeys(argv, english) {
  const keys = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    let list = null;
    if (arg === '--reset') {
      list = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--reset=')) {
      list = arg.slice('--reset='.length);
    } else {
      throw new Error(`Unknown argument ${arg}`);
    }
    if (!list) throw new Error('--reset needs a comma-separated list of keys');
    list.split(',').map(key => key.trim()).filter(Boolean).forEach(key => keys.add(key));
  }

  const englishKeys = new Set(flattenKeys(english));
  for (const key of keys) {
    if (!englishKeys.has(key)) throw new Error(`--reset: ${key} is not an English key`);
  }
  return keys;
}

function main() {
  const english = loadEnglish();
  const resetKeys = parseResetKeys(process.argv.slice(2), english);
  const files = fs.readdirSync(localeDir)
    .filter(name => name.endsWith('.js'))
    .sort()
    .map(name => path.join(localeDir, name));

  for (const file of files) {
    const result = syncLocale(file, english, resetKeys);
    const summary = `added ${result.added.length}, reset ${result.reset.length}, removed ${result.removed.length}`;
    console.log(`${result.lang}: ${result.changed ? summary : 'up to date'}`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { parseObjectLiteral, quote, formatLeaf };
