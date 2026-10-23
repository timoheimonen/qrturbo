/**
 * A manual clock for unit tests, with its own setTimeout, clearTimeout and
 * requestAnimationFrame. Time only moves when a test advances it, so an
 * ordering assertion around a debounce never depends on how busy the machine
 * is, and no test sleeps in real time.
 *
 * Promise callbacks still run on the real microtask queue: every step lets
 * them settle (through a real setImmediate) before the next timer runs, so a
 * timer that a promise chain schedules is seen in the same advance.
 */

// One frame at 60 Hz.
const FRAME_MS = 16;

const realSetImmediate = setImmediate;

function createFakeClock({ now: start = 0 } = {}) {
  const timers = new Map();
  let now = start;
  let nextId = 1;

  function setTimeout(fn, ms = 0, ...args) {
    const id = nextId;
    nextId += 1;
    timers.set(id, { id, fn, args, at: now + Math.max(0, Number(ms) || 0) });
    return id;
  }

  function clearTimeout(id) {
    timers.delete(id);
  }

  function requestAnimationFrame(fn) {
    return setTimeout(() => fn(now), FRAME_MS);
  }

  /** Lets every queued promise callback run. */
  function flush() {
    return new Promise(resolve => realSetImmediate(resolve));
  }

  // The earliest timer, first scheduled first among equal times.
  function nextTimer() {
    let next = null;
    for (const timer of timers.values()) {
      if (!next || timer.at < next.at) next = timer;
    }
    return next;
  }

  async function runTimer(timer) {
    timers.delete(timer.id);
    now = Math.max(now, timer.at);
    timer.fn(...timer.args);
    await flush();
  }

  /** Moves the clock forward by `ms`, running every timer due on the way. */
  async function advance(ms) {
    const target = now + ms;
    await flush();
    for (let timer = nextTimer(); timer && timer.at <= target; timer = nextTimer()) {
      await runTimer(timer);
    }
    now = target;
  }

  /**
   * Runs timers in order until `predicate` holds. Throws when no timer is
   * left, or the next one is more than `limit` ms away, first.
   */
  async function runUntil(predicate, limit = 60000) {
    const started = now;
    await flush();
    while (!predicate()) {
      const timer = nextTimer();
      if (!timer || timer.at > started + limit) {
        throw new Error(`Still waiting after ${now - started} ms with ${timers.size} timer(s) left`);
      }
      await runTimer(timer);
    }
  }

  /** Runs timers until `promise` settles, then returns its value. */
  async function settle(promise, limit) {
    let done = false;
    const tracked = Promise.resolve(promise).finally(() => {
      done = true;
    });
    tracked.catch(() => {});
    await runUntil(() => done, limit);
    return tracked;
  }

  /** The delays, from now, of the timers that have not run yet. */
  function pending() {
    return [...timers.values()].map(timer => timer.at - now).sort((a, b) => a - b);
  }

  /**
   * Replaces the global setTimeout and clearTimeout (which code loaded with
   * require looks up at call time) until the test `t` ends.
   */
  function install(t) {
    const saved = { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout };
    globalThis.setTimeout = setTimeout;
    globalThis.clearTimeout = clearTimeout;
    t.after(() => Object.assign(globalThis, saved));
  }

  return {
    setTimeout,
    clearTimeout,
    requestAnimationFrame,
    cancelAnimationFrame: clearTimeout,
    now: () => now,
    advance,
    flush,
    install,
    pending,
    runUntil,
    settle
  };
}

module.exports = { FRAME_MS, createFakeClock };
