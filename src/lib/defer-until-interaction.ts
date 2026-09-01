type DeferCallback = () => void;

let armed = false;
let activated = false;
const queue: DeferCallback[] = [];

function flush() {
  while (queue.length > 0) {
    queue.shift()?.();
  }
}

function activate() {
  if (activated) return;
  activated = true;
  flush();
  for (const event of events) {
    window.removeEventListener(event, onActivate);
  }
  window.clearTimeout(fallbackTimer);
}

const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
let fallbackTimer = 0;

function onActivate() {
  activate();
}

function arm() {
  if (armed || typeof window === "undefined") return;
  armed = true;

  for (const event of events) {
    window.addEventListener(event, onActivate, { once: true, passive: true });
  }

  fallbackTimer = window.setTimeout(onActivate, 12_000);
}

/** Run work after first user interaction, or after a long fallback timeout. */
export function deferUntilInteraction(callback: DeferCallback) {
  if (typeof window === "undefined") return;
  if (activated) {
    callback();
    return;
  }
  queue.push(callback);
  arm();
}
