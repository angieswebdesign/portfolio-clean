import { createSurfaceNodeMap } from "../modules/surface-node/surface-node.js";
import { surfaceNodeData } from "../modules/surface-node/surface-node-data.js";

let surfaceInstance = null;

export function initIntro(config = {}) {
  const container = config.container ?? document.querySelector("[data-surface-node-map]") ?? document.querySelector(".intro-viz");

  if (!container) return null;

  surfaceInstance?.destroy();
  surfaceInstance = createSurfaceNodeMap({
    container,
    data: config.data ?? surfaceNodeData,
    options: {
      assetBaseUrl: config.assetBaseUrl ?? "",
      ...config.options
    }
  });

  return surfaceInstance;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initIntro());
} else {
  initIntro();
}
