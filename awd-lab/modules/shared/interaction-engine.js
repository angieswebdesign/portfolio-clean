import { clamp, createDisposables, easeSigned } from "./visualization-utils.js";

export function revealSequential(elements, options = {}) {
  const {
    className = "is-visible",
    stagger = 80,
    delay = 0
  } = options;

  const timers = elements.map((element, index) =>
    window.setTimeout(() => {
      element.classList.add(className);
    }, delay + index * stagger)
  );

  return () => timers.forEach((timer) => window.clearTimeout(timer));
}

export function bindHoverState(elements, options = {}) {
  const {
    className = "is-hovered",
    onEnter,
    onLeave
  } = options;

  const disposables = createDisposables();

  elements.forEach((element) => {
    disposables.listen(element, "mouseenter", (event) => {
      element.classList.add(className);
      onEnter?.(element, event);
    });

    disposables.listen(element, "mouseleave", (event) => {
      element.classList.remove(className);
      onLeave?.(element, event);
    });
  });

  return disposables.cleanup;
}

export function createActiveState(elements, options = {}) {
  const { className = "is-active", onChange } = options;
  let activeElement = null;

  function setActive(nextElement) {
    if (activeElement === nextElement) return;
    activeElement?.classList.remove(className);
    activeElement = nextElement;
    activeElement?.classList.add(className);
    onChange?.(activeElement);
  }

  return {
    get activeElement() {
      return activeElement;
    },
    setActive,
    clear() {
      setActive(null);
    },
    destroy() {
      activeElement?.classList.remove(className);
      activeElement = null;
    }
  };
}

export function initSurfaceMotion({ surface, nodes = [], maxRotation = 38 }) {
  const disposables = createDisposables();
  let isInteracting = false;

  function projectPointer(clientX, clientY, xMultiplier, yMultiplier) {
    const rect = surface.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const rawX = (clientX - rect.left) / rect.width;
    const rawY = (clientY - rect.top) / rect.height;
    const normX = clamp(rawX, 0, 1) - 0.5;
    const normY = clamp(rawY, 0, 1) - 0.5;

    const x = easeSigned(normX) * maxRotation * xMultiplier;
    const y = easeSigned(normY) * -maxRotation * yMultiplier;

    surface.style.setProperty("--light-x", normX);
    surface.style.transform = `
      rotateY(${x}deg)
      rotateX(${y}deg)
      scale(1.05)
    `;
  }

  disposables.listen(surface, "pointermove", (event) => {
    if (event.pointerType === "mouse" || isInteracting) {
      projectPointer(event.clientX, event.clientY, 2.6, 2.6);
    }
  });

  disposables.listen(surface, "pointerdown", () => {
    isInteracting = true;
  });

  disposables.listen(surface, "pointerup", () => {
    isInteracting = false;
  });

  disposables.listen(surface, "pointerleave", () => {
    isInteracting = false;
  });

  disposables.listen(window, "pointercancel", () => {
    isInteracting = false;
  });

  nodes.forEach((node) => {
    disposables.listen(node, "mouseenter", () => {
      const rect = node.getBoundingClientRect();
      projectPointer(rect.left + rect.width / 2, rect.top + rect.height / 2, 1.6, 0.6);
      node.style.transition = "transform var(--motion-fast, 160ms) var(--ease-standard, ease), opacity 400ms ease";
    });

    disposables.listen(node, "mouseleave", () => {
      node.style.transform = "translate(0px, 0px)";
    });
  });

  return {
    destroy: disposables.cleanup
  };
}
