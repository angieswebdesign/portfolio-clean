(function () {
  console.log("Layer 3 JS loaded");
})();

import { renderOverlayPanel } from "./components.js";

import { positionOverlayPanel } from "./chart.js";
let overlayTriangle = null;

export function openModal(data) {
  window.__activeCircle = data.__circle__;
  const modalRoot = document.getElementById("modal-root");
  
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
  positionOverlayPanel(data.__circle__);

  const panelEl = document.querySelector(".overlay__panel");

  const waitForLayout = () => {
    const rect1 = panelEl.getBoundingClientRect();

    requestAnimationFrame(() => {
      const rect2 = panelEl.getBoundingClientRect();

      const stable =
        Math.abs(rect1.left - rect2.left) < 1 &&
        Math.abs(rect1.width - rect2.width) < 1;

      if (!stable) {
        waitForLayout();
        return;
      }

      buildTriangle(rect2);
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

  const node = window.__activeCircle?.getBoundingClientRect();

  if (!node) return;

  const panelHeight = panelEl.getBoundingClientRect().height;
  const MIN_WEDGE = 4;

  const nodeCenterX = node.left + node.width / 2;
  const nodeCenterY = node.top + node.height / 2;

  const Ay = nodeCenterY - panelRect.top;
  const Ayclamped = Math.max(0, Math.min(panelHeight, Ay));

  overlayTriangle.style.top =
  `${Math.floor(panelRect.top - overlayRect.top)}px`;

  const panelIsRightOfNode = panelRect.left > node.left;

  if (panelIsRightOfNode) {
    const wedgeWidth = panelRect.left - nodeCenterX;

    if (wedgeWidth > MIN_WEDGE) {
      overlayTriangle.style.width = `${wedgeWidth}px`;
      overlayTriangle.style.height = `${panelHeight + 1}px`;

      overlayTriangle.setAttribute("viewBox", `0 0 ${wedgeWidth} ${panelHeight}`);
      overlayTriangle.setAttribute("preserveAspectRatio", "none");

      overlayTriangle.style.left =
        `${panelRect.left - overlayRect.left - wedgeWidth}px`;

      overlayTriangle.innerHTML = `
        <polygon points="
          ${wedgeWidth},0
          ${wedgeWidth},${panelHeight}
          0,${Ayclamped}
        " fill="var(--overlay-triangle-bg)" />
      `;

      overlayTriangle.classList.add("is-visible");
    }
  } else {
    const wedgeWidth = nodeCenterX - panelRect.right;

    if (wedgeWidth > MIN_WEDGE) {
      overlayTriangle.style.width = `${wedgeWidth}px`;
      overlayTriangle.style.height = `${panelHeight}px`;

      overlayTriangle.setAttribute("viewBox", `0 0 ${wedgeWidth} ${panelHeight}`);
      overlayTriangle.setAttribute("preserveAspectRatio", "none");

      overlayTriangle.style.left =
        `${panelRect.right - overlayRect.left}px`;

      overlayTriangle.innerHTML = `
        <polygon points="
          0,0
          0,${panelHeight}
          ${wedgeWidth},${Ayclamped}
        " fill="var(--overlay-triangle-bg)" />
      `;

      overlayTriangle.classList.add("is-visible");
    }
  }

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
}

// ======================================================
// LAYER 3 — CASE STUDY OVERLAY
// ======================================================


export function openCaseStudy(project) {
  const layer3 = document.getElementById("layer-3-overlay");
  const closeBtn = document.getElementById("layer-3-close");

  if (!layer3) {
    console.warn("Layer 3 overlay not found");
    return;
  }

  if (!project?.id) {
    console.warn("openCaseStudy called without a valid project:", project);
    return;
  }

  layer3.classList.add("is-open");
  layer3.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-layer-3-open");

  console.log("Layer 3 opened for:", project.id);

  if (!project?.htmlInclude) {
    console.warn("No htmlInclude defined for project:", project.id);
    return;
  }

  fetch(project.htmlInclude)
    .then((res) => res.text())
    .then((html) => {
      const stage = document.querySelector(".layer-3-stage");
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
    layer3.classList.remove("is-open");
    layer3.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-layer-3-open");
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



// ======================================================
// END LAYER 3 — CASE STUDY OVERLAY
// ======================================================


