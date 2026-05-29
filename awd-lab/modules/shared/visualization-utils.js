export function resolveContainer(container) {
  if (typeof container === "string") {
    const match = document.querySelector(container);
    if (!match) throw new Error(`Visualization container not found: ${container}`);
    return match;
  }

  if (container instanceof Element) return container;

  throw new Error("Visualization container must be a selector or Element.");
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function easeSigned(value) {
  return value * value * Math.sign(value);
}

export function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

export function createRafScheduler(callback) {
  let frame = null;

  return {
    schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        callback();
      });
    },
    cancel() {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = null;
    }
  };
}

export function observeResize(element, callback) {
  if (!("ResizeObserver" in window)) {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }

  const observer = new ResizeObserver(callback);
  observer.observe(element);

  return () => observer.disconnect();
}

export function createRedrawController({ element, measure, render }) {
  let metrics = null;
  const scheduler = createRafScheduler(() => {
    metrics = measure?.() ?? metrics;
    render(metrics);
  });

  const cleanupResize = element ? observeResize(element, scheduler.schedule) : () => {};

  return {
    get metrics() {
      return metrics;
    },
    schedule: scheduler.schedule,
    redrawNow() {
      scheduler.cancel();
      metrics = measure?.() ?? metrics;
      render(metrics);
    },
    destroy() {
      scheduler.cancel();
      cleanupResize();
    }
  };
}

export async function waitForImages(root) {
  const images = [...root.querySelectorAll("img")];

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth) return Promise.resolve();
      if (typeof image.decode === "function") {
        return image.decode().catch(() => undefined);
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })
  );
}

export async function waitForStableRect(element, options = {}) {
  const { tolerance = 1, maxFrames = 12 } = options;

  let previous = null;

  for (let i = 0; i < maxFrames; i += 1) {
    await nextFrame();
    const rect = element.getBoundingClientRect();

    if (
      previous &&
      Math.abs(previous.left - rect.left) < tolerance &&
      Math.abs(previous.top - rect.top) < tolerance &&
      Math.abs(previous.width - rect.width) < tolerance &&
      Math.abs(previous.height - rect.height) < tolerance
    ) {
      return rect;
    }

    previous = rect;
  }

  return element.getBoundingClientRect();
}

export function createDisposables() {
  const disposables = [];

  return {
    add(disposable) {
      disposables.push(disposable);
      return disposable;
    },
    listen(target, eventName, handler, options) {
      target.addEventListener(eventName, handler, options);
      disposables.push(() => target.removeEventListener(eventName, handler, options));
    },
    cleanup() {
      while (disposables.length) {
        const dispose = disposables.pop();
        dispose();
      }
    }
  };
}

export function loadJson(url) {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`Failed to load JSON: ${url}`);
    return response.json();
  });
}

export function positionPanelNearAnchor(anchorElement, config = {}) {
  const {
    overlay,
    panel,
    insets = {
      top: 105,
      side: 100
    }
  } = config;

  if (!anchorElement || !overlay || !panel) return null;

  const overlayRect = overlay.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const panelWidth = panelRect.width;

  if (!panelWidth) return null;

  const anchorRect = anchorElement.getBoundingClientRect();
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  const overlayCenterX = overlayRect.left + overlayRect.width / 2;
  const leftX = insets.side;
  const rightX = overlayRect.width - panelWidth - insets.side;
  const centerX = (overlayRect.width - panelWidth) / 2;
  const distanceFromCenter = Math.abs(anchorCenterX - overlayCenterX);

  let x;
  if (distanceFromCenter < panelWidth / 2) {
    x = centerX;
  } else if (anchorCenterX < overlayCenterX) {
    x = rightX;
  } else {
    x = leftX;
  }

  panel.style.left = `${clamp(x, 0, Math.max(0, overlayRect.width - panelWidth))}px`;
  panel.style.top = `${insets.top}px`;

  return panel.getBoundingClientRect();
}
