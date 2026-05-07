// intro/motion.js

export function initMotion({ nodes, surface }) {
  initSurfaceMotion(surface);
  initNodeMotion(nodes, surface);

  const nodes = document.querySelectorAll("[data-node]");

  nodes.forEach(node => {
    node.classList.add("is-visible");
  });
}

const MAX_ROT = 38;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (v) => v * v * Math.sign(v);

// -----------------------------
// SURFACE (global parallax)
// -----------------------------

function initSurfaceMotion(surface) {

  let isInteracting = false;


  function handlePointerMove(e) {
    if (e.pointerType === "mouse" || isInteracting) {

      const rect = surface.getBoundingClientRect();

      const rawX = (e.clientX - rect.left) / rect.width;
      const rawY = (e.clientY - rect.top) / rect.height;

      const clampedX = clamp(rawX, 0, 1);
      const clampedY = clamp(rawY, 0, 1);

      const normX = clampedX - 0.5;
      const normY = clampedY - 0.5;

      const x = ease(normX) * MAX_ROT * 2.6;
      const y = ease(normY) * -MAX_ROT * 2.6;

      surface.style.setProperty('--light-x', normX);

      surface.style.transform = `
        rotateY(${x}deg)
        rotateX(${y}deg)
        scale(1.05)
      `;
    }
  }


  window.addEventListener("pointercancel", () => {
    isInteracting = false;
  });

  surface.addEventListener("pointermove", handlePointerMove);
  surface.addEventListener("pointerdown", () => isInteracting = true);
  surface.addEventListener("pointerup", () => isInteracting = false);
  surface.addEventListener("pointerleave", () => isInteracting = false);
}



// -----------------------------
// NODE MOTION (local interaction)
// -----------------------------

function initNodeMotion(nodes, surface) {
  nodes.forEach((node) => {
    node.addEventListener("mouseenter", () => {
      const rect = surface.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const nodeCenterX = nodeRect.left + nodeRect.width / 2;
      const nodeCenterY = nodeRect.top + nodeRect.height / 2;

      const rawX = (nodeCenterX - rect.left) / rect.width;
      const rawY = (nodeCenterY - rect.top) / rect.height;

      const normX = rawX - 0.5;
      const normY = rawY - 0.5;

      const x = ease(normX) * MAX_ROT * 1.6;
      const y = ease(normY) * -MAX_ROT * 0.6; 

      surface.style.setProperty('--light-x', normX);

      surface.style.transform = `
        rotateY(${x}deg)
        rotateX(${y}deg)
        scale(1.05)
      `;

      node.style.transition = "transform var(--motion-fast) var(--ease-standard), opacity 400ms ease";
    });


    node.addEventListener("mouseleave", () => {
      node.style.transform = "translate(0px, 0px)";
    });
  });
}