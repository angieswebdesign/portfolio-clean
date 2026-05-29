import { initSurfaceMotion, revealSequential } from "../shared/interaction-engine.js";
import {
  createDisposables,
  createRedrawController,
  resolveContainer,
  waitForImages,
  waitForStableRect
} from "../shared/visualization-utils.js";
import { surfaceNodeData } from "./surface-node-data.js";

const DEFAULT_OPTIONS = {
  assetBaseUrl: "",
  mobileBreakpoint: 768,
  revealClass: "is-visible",
  revealStagger: 80,
  interactive: true
};

const TEMPLATE = `
  <div class="sn-surface-node" data-sn-root aria-hidden="true">
    <div class="sn-surface-node__surface">
      <div class="sn-surface-node__motion" data-sn-surface>
        <div class="sn-surface-node__content">
          <img class="sn-surface-node__face" data-sn-face alt="Surface face" />
          <img class="sn-surface-node__edge" data-sn-edge alt="Surface edge" />
        </div>
      </div>
    </div>
    <div class="sn-surface-node__nodes" data-sn-nodes></div>
  </div>
`;

export function createSurfaceNodeMap(config = {}) {
  const host = resolveContainer(config.container);
  const state = {
    host,
    root: null,
    surface: null,
    nodesRoot: null,
    nodes: [],
    data: structuredClone(config.data ?? surfaceNodeData),
    options: {
      ...DEFAULT_OPTIONS,
      ...config.options
    },
    metrics: null,
    motion: null,
    revealCleanup: null,
    destroyed: false
  };

  const disposables = createDisposables();
  mountTemplate(state);
  renderSurface(state);
  renderNodes(state);

  const redrawController = createRedrawController({
    element: state.root,
    measure: () => measureSurfaceNode(state),
    render: (metrics) => {
      state.metrics = metrics;
      redraw(state, metrics);
    }
  });

  disposables.add(redrawController.destroy);

  initializeWhenMeasured(state);

  const api = {
    get element() {
      return state.root;
    },
    get surface() {
      return state.surface;
    },
    get nodes() {
      return [...state.nodes];
    },
    redraw() {
      redrawController.schedule();
    },
    updateData(nextData) {
      state.data = structuredClone(nextData);
      renderSurface(state);
      renderNodes(state);
      initializeWhenMeasured(state);
      redrawController.schedule();
    },
    destroy() {
      state.destroyed = true;
      state.motion?.destroy();
      state.revealCleanup?.();
      disposables.cleanup();
      state.host.replaceChildren();
    }
  };

  return api;
}

function mountTemplate(state) {
  const existingRoot = state.host.classList.contains("sn-surface-node")
    ? state.host
    : state.host.querySelector(".sn-surface-node");

  if (existingRoot) {
    state.root = existingRoot;
  } else {
    state.host.innerHTML = TEMPLATE;
    state.root = state.host.querySelector(".sn-surface-node");
  }

  state.surface = state.root.querySelector("[data-sn-surface]");
  state.nodesRoot = state.root.querySelector("[data-sn-nodes]");

  if (!state.surface || !state.nodesRoot) {
    throw new Error("Surface-node template is missing required mount points.");
  }
}

function renderSurface(state) {
  const face = state.root.querySelector("[data-sn-face]");
  const edge = state.root.querySelector("[data-sn-edge]");
  const surface = state.data.surface ?? {};

  face.src = resolveAssetUrl(surface.faceSrc, state.options.assetBaseUrl);
  face.alt = surface.faceAlt ?? "";
  edge.src = resolveAssetUrl(surface.edgeSrc, state.options.assetBaseUrl);
  edge.alt = surface.edgeAlt ?? "";
}

function renderNodes(state) {
  state.nodesRoot.replaceChildren();

  state.nodes = (state.data.nodes ?? []).map((nodeData, index) => {
    const node = document.createElement("button");
    node.className = "sn-surface-node__node";
    node.type = "button";
    node.dataset.nodeId = nodeData.id ?? `node-${index + 1}`;
    node.setAttribute("aria-label", nodeData.label ?? `Surface node ${index + 1}`);
    node.__datum__ = nodeData;
    state.nodesRoot.appendChild(node);
    return node;
  });

}

async function initializeWhenMeasured(state) {
  await waitForImages(state.root);
  await waitForStableRect(state.surface);

  if (state.destroyed) return;

  state.motion?.destroy();
  state.motion = state.options.interactive
    ? initSurfaceMotion({
      surface: state.surface,
      nodes: state.nodes
    })
    : null;

  state.revealCleanup?.();
  state.revealCleanup = revealSequential(state.nodes, {
    className: state.options.revealClass,
    stagger: state.options.revealStagger
  });

  redraw(state, measureSurfaceNode(state));
}

function measureSurfaceNode(state) {
  return {
    isMobile: state.root.clientWidth <= state.options.mobileBreakpoint || window.innerWidth <= state.options.mobileBreakpoint
  };
}

function redraw(state, metrics = state.metrics) {
  if (state.destroyed) return;
  applyNodePositions(state, metrics);
}

function applyNodePositions(state, metrics = measureSurfaceNode(state)) {
  state.nodes.forEach((node) => {
    const nodeData = node.__datum__;
    const position = metrics.isMobile ? nodeData.mobile ?? nodeData.desktop : nodeData.desktop;

    node.style.top = position?.top ?? "";
    node.style.left = position?.left ?? "";
    node.style.right = position?.right ?? "";
    node.style.bottom = position?.bottom ?? "";
    node.style.transform = position?.transform ?? "";
  });
}

function resolveAssetUrl(src, baseUrl) {
  if (!src || /^(https?:)?\/\//.test(src) || src.startsWith("data:") || src.startsWith("/")) {
    return src;
  }

  return `${baseUrl}${src}`;
}
