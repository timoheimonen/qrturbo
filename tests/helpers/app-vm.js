const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '../..');

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
      // Payload unit tests intentionally exercise the non-DOM alert fallback;
      // browser tests cover the real inline error region in index.html.
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

  context.window.window = context.window;
  context.window.document = document;
  context.window.navigator = context.navigator;
  context.window.localStorage = context.localStorage;
  context.window.alert = context.alert;
  context.window.t = context.t;

  vm.createContext(context);
  const appPath = path.join(repoRoot, 'Public/js/app.js');
  const appSource = fs.readFileSync(appPath, 'utf8');
  vm.runInContext(appSource, context, { filename: appPath });

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
    }
  };
}

module.exports = {
  createAppHarness,
  repoRoot
};
