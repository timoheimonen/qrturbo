const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '../..');

// The pure modules and frame.js load before app.js, in template order, so
// app.js finds them as globals exactly as it does in the browser.
const APP_SCRIPTS = [
  'lib/bytes.js',
  'lib/color.js',
  'lib/capacity.js',
  'lib/payloads.js',
  'lib/rules.js',
  'frame.js',
  'app.js'
];

function createElement(initial = {}) {
  return {
    value: '',
    checked: false,
    disabled: false,
    hidden: false,
    textContent: '',
    innerHTML: '',
    dataset: {},
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    setAttribute() {},
    removeAttribute() {},
    addEventListener() {},
    dispatchEvent() {},
    focus() {},
    ...initial
  };
}

function createAppHarness() {
  const elements = new Map();
  let activeTab = 'URLText';
  const alerts = [];

  function getElement(id) {
    if (!elements.has(id)) {
      elements.set(id, createElement());
    }
    return elements.get(id);
  }

  const document = {
    documentElement: createElement({ dataset: {} }),
    addEventListener() {},
    getElementById(id) {
      // Payload unit tests intentionally exercise the validation sink used
      // when there is no #form-error; browser tests cover the inline region.
      return id === 'form-error' ? null : getElement(id);
    },
    querySelector(selector) {
      if (selector === '.tab-link.active') {
        return createElement({ dataset: { tab: activeTab } });
      }

      if (selector === 'input[name="sms-phone-type"]:checked') {
        return getElement('sms-type-phone').checked
          ? createElement({ value: 'phone' })
          : createElement({ value: 'sms' });
      }

      return null;
    },
    querySelectorAll() {
      return [];
    }
  };

  const context = {
    console,
    document,
    navigator: {},
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {}
    },
    window: {
      addEventListener() {},
      clearTimeout,
      setTimeout
    },
    alert(message) {
      alerts.push(message);
    },
    t(key, vars = {}) {
      return Object.entries(vars).reduce(
        (value, [name, replacement]) => value.replace(`{{${name}}}`, replacement),
        key
      );
    },
    Blob,
    URL,
    URLSearchParams,
    TextEncoder,
    TextDecoder,
    FileReader: class FileReader {},
    Event: class Event {
      constructor(type) {
        this.type = type;
      }
    },
    setTimeout,
    clearTimeout
  };

  // Validation messages that have no #form-error to go to. No crypto is
  // provided, so code that needs random IDs exercises its fallback.
  context.__qrturboValidationSink = message => {
    alerts.push(message);
  };

  context.window.window = context.window;
  context.window.document = document;
  context.window.navigator = context.navigator;
  context.window.localStorage = context.localStorage;
  context.window.alert = context.alert;
  context.window.t = context.t;

  vm.createContext(context);
  for (const script of APP_SCRIPTS) {
    const scriptPath = path.join(repoRoot, 'Public/js', script);
    vm.runInContext(fs.readFileSync(scriptPath, 'utf8'), context, { filename: scriptPath });
  }

  return {
    context,
    alerts,
    getElement,
    setValue(id, value) {
      getElement(id).value = value;
    },
    setChecked(id, checked) {
      getElement(id).checked = checked;
    },
    setActiveTab(tab) {
      activeTab = tab;
    },
    collect(showAlerts = false) {
      return context.collectQRCodeText(showAlerts);
    },
    content(showErrors = false) {
      return context.collectContent(showErrors);
    }
  };
}

const publicJsDir = path.join(repoRoot, 'Public/js');
const localeDir = path.join(publicJsDir, 'i18n/locales');

/**
 * First-party scripts under Public/js as paths relative to it, sorted.
 * Vendored code and the locale data files are left out.
 */
function listFirstPartyScripts() {
  const files = [];

  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relative = path.relative(publicJsDir, fullPath).split(path.sep).join('/');
      if (entry.isDirectory()) {
        if (relative !== 'vendor' && relative !== 'i18n/locales') walk(fullPath);
      } else if (entry.name.endsWith('.js') && relative !== 'qr-code-styling.min.js') {
        files.push(relative);
      }
    }
  })(publicJsDir);

  return files.sort();
}

function listLocales() {
  return fs.readdirSync(localeDir)
    .filter(fileName => fileName.endsWith('.js'))
    .map(fileName => path.basename(fileName, '.js'))
    .sort();
}

/**
 * Runs core.js and every locale file in one context and returns the
 * registered translations, keyed by language.
 */
function loadTranslations() {
  const context = {
    window: {},
    document: {
      addEventListener() {},
      getElementById() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      querySelector() {
        return null;
      },
      documentElement: {
        getAttribute() {
          return 'en';
        },
        setAttribute() {}
      },
      head: {
        appendChild() {}
      },
      createElement() {
        return {};
      }
    },
    navigator: {
      languages: ['en-US'],
      language: 'en-US'
    },
    localStorage: {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {}
    },
    console,
    setTimeout,
    clearTimeout
  };

  context.window.window = context.window;
  context.window.document = context.document;
  vm.createContext(context);
  const corePath = path.join(publicJsDir, 'i18n/core.js');
  vm.runInContext(fs.readFileSync(corePath, 'utf8'), context, { filename: corePath });

  for (const lang of listLocales()) {
    const localePath = path.join(localeDir, `${lang}.js`);
    vm.runInContext(fs.readFileSync(localePath, 'utf8'), context, { filename: localePath });
  }

  return context.window.translations;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object') {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenKeys(nested, nextPrefix);
  });
}

function getNestedValue(object, key) {
  return key.split('.').reduce((value, part) => value?.[part], object);
}

module.exports = {
  createAppHarness,
  flattenKeys,
  getNestedValue,
  listFirstPartyScripts,
  listLocales,
  loadTranslations,
  repoRoot
};
