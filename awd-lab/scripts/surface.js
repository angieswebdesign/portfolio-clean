// intro/intro.js

import { initMotion } from "./motion.js";

export function initIntro() {
  const nodes = document.querySelectorAll("[data-node]");
  const surface = document.querySelector("[data-surface]");

  if (!nodes.length || !surface) {
    console.warn("Intro init failed: missing nodes or surface");
    return;
  }

  initMotion({ nodes, surface });

  revealNodes(nodes);
}

function revealNodes(nodes) {
  nodes.forEach((node, i) => {
    setTimeout(() => {
      node.classList.add("node-visible");
    }, i * 80);
  });
}

window.addEventListener("DOMContentLoaded", initIntro);