// intro/intro.js

import { initMotion } from "./motion.js";

export function initIntro() {
  const nodes = document.querySelectorAll("[data-node]");
  const surface = document.querySelector("[data-surface]");

  if (nodes.length && surface) {
  initMotion({ nodes, surface });
  revealNodes(nodes);
  }

  // ALWAYS run this

  initMotion({ nodes, surface });

  revealNodes(nodes);
  
}

function revealNodes(nodes) {
  nodes.forEach((node, i) => {
    setTimeout(() => {
      node.classList.add("is-visible");
    }, i * 80);
  });
}

window.addEventListener("DOMContentLoaded", initIntro);