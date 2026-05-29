(function () {
  console.log("Layer 3 JS loaded");
})();

import { renderOverlayPanel } from "./components.js";

import { positionPanelNearAnchor } from "../modules/shared/visualization-utils.js";
import {
  calculateTriangleConnector,
  renderTriangleConnector
} from "../modules/shared/svg-utils.js";

let overlayTriangle = null;
let activeAnchor = null;

export function openModal(data, config = {}) {
  activeAnchor = config.anchorElement;
  const modalRoot = resolveElement(config.modalRoot ?? "#modal-root");

  if (!modalRoot || !activeAnchor) return null;
  
  modalRoot.innerHTML = `
  <div id="modal-overlay">
    <div class="overlay-outer-close-container">
      <a class="close-btn" id="close-modal">x</a>
    </div>
    ${renderOverlayPanel(data)}
  </div>
`;
  
  // NOTE:
  // Directional reveal (left→right vs right→left) intentionally simplified.
  // Prior attempts introduced clip-path race conditions.
  // Current implementation favors stability.
  overlayTriangle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  overlayTriangle.style.position = "absolute";
  overlayTriangle.style.pointerEvents = "none";
  
  overlayTriangle.classList.add("overlay-triangle");
  
  const overlayRoot = document.getElementById("modal-overlay");
  
  if (!overlayRoot) {
    console.warn("modal-overlay not found — triangle not appended");
  } else {
    overlayRoot.appendChild(overlayTriangle);
    console.log("triangle appended to modal-overlay");
  }
  
  console.log("triangle appended", overlayTriangle);
  
  const overlay = document.getElementById("modal-overlay");
  overlay.setAttribute("data-open", "true");
  
  const panelEl = document.querySelector(".overlay__panel");
  panelEl.style.opacity = "0";
  
  const caseStudyBtn = modalRoot.querySelector("[data-open-case-study]");

  if (caseStudyBtn) {
    caseStudyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openCaseStudy(data);
    });
  }

  const rail = document.getElementById("content-rail");
  if (rail) {
    rail.setAttribute("data-locked", "true");
  }

  
requestAnimationFrame(() => {
  positionPanelNearAnchor(activeAnchor, {
    overlay,
    panel: panelEl,
    insets: config.insets
  });

  const waitForLayout = () => {
    const rect1 = panelEl.getBoundingClientRect();

    requestAnimationFrame(() => {
      const rect2 = panelEl.getBoundingClientRect();

      const stable =
        Math.abs(rect1.left - rect2.left) < 1 &&
        Math.abs(rect1.width - rect2.width) < 1&&
        Math.abs(rect1.height - rect2.height) < 1;

      if (!stable) {
        waitForLayout();
        return;
      }

      buildTriangle(rect2);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlayTriangle.classList.add("is-visible");
        });
      });

      // ✅ re-run once more after layout settles (fixes first-click issue)
      requestAnimationFrame(() => {
        const finalRect = panelEl.getBoundingClientRect();
        buildTriangle(finalRect);
      });
    });
  };

  waitForLayout();
});  

  
  document
  .getElementById("close-modal")
  .addEventListener("click", closeModal);
  
  document
  .getElementById("modal-overlay")
  .addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  
  return overlay; 
}


function buildTriangle(panelRect) {
  const overlayRoot = document.getElementById("modal-overlay");
  const panelEl = document.querySelector(".overlay__panel");

  const overlayRect = overlayRoot.getBoundingClientRect();

  const node = activeAnchor?.getBoundingClientRect();

  if (!node) return;

  const connector = calculateTriangleConnector({
    nodeRect: node,
    panelRect,
    overlayRect
  });

  renderTriangleConnector(overlayTriangle, connector, "var(--overlay-triangle-bg)");

  // reveal panel after triangle
  setTimeout(() => {
    panelEl.style.transition = `opacity var(--overlay-panel-enter-duration) ease-out`;
    panelEl.style.opacity = "1";
  }, parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue("--overlay-triangle-enter-duration")
  ));
}


function closeModal() {
  const modalRoot = document.getElementById("modal-root");
  if (overlayTriangle) overlayTriangle.remove();
  if (overlayTriangle) {
    overlayTriangle.classList.remove("is-visible");
  }
  const rail = document.getElementById("content-rail");
  if (rail) {
    rail.removeAttribute("data-locked");
  }

  modalRoot.innerHTML = "";
  activeAnchor = null;
}

// ======================================================
// LAYER 3 — CASE STUDY OVERLAY
// ======================================================


export function openCaseStudy(project, config = {}) {
  const layer3 = resolveElement(config.layerRoot ?? "#layer-3-overlay");
  const closeBtn = resolveElement(config.closeButton ?? "#layer-3-close");
  const stageSelector = config.stage ?? ".layer-3-stage";
  const openClass = config.openClass ?? "is-open";
  const bodyClass = config.bodyClass ?? "is-layer-3-open";

  if (!layer3) {
    console.warn("Layer 3 overlay not found");
    return;
  }

  if (!project?.id) {
    console.warn("openCaseStudy called without a valid project:", project);
    return;
  }

  layer3.classList.add(openClass);
  layer3.setAttribute("aria-hidden", "false");
  document.body.classList.add(bodyClass);

  console.log("Layer 3 opened for:", project.id);

  if (!project?.htmlInclude) {
    console.warn("No htmlInclude defined for project:", project.id);
    return;
  }

  fetch(project.htmlInclude)
    .then((res) => res.text())
    .then((html) => {
      const stage = resolveElement(stageSelector);
      if (!stage) {
        console.warn("Layer 3 stage not found");
        return;
      }
      stage.innerHTML = html;
    })
    .catch((err) => {
      console.error("Failed to load case study include:", err);
    });

  function closeLayer3() {
    layer3.classList.remove(openClass);
    layer3.setAttribute("aria-hidden", "true");
    document.body.classList.remove(bodyClass);
    document.removeEventListener("keydown", onEscape);
  }

  function onEscape(e) {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    closeLayer3();
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLayer3, { once: true });
  }

  document.addEventListener("keydown", onEscape);
}

function resolveElement(target) {
  if (typeof target === "string") return document.querySelector(target);
  return target;
}



// ======================================================
// END LAYER 3 — CASE STUDY OVERLAY
// ======================================================
