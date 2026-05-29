import { createScatterplot } from "../modules/scatterplot/scatterplot.js";
import {
  loadScatterplotData,
  normalizeScatterplotData
} from "../modules/scatterplot/scatterplot-data.js";
import { openModal } from "./modal.js";

let chartInstance = null;

export async function initProjectChart(config = {}) {
  const container = config.container ?? document.querySelector("[data-scatterplot]") ?? document.getElementById("chart");

  if (!container) return null;

  const rawData = config.data ?? await loadScatterplotData(config.dataUrl ?? "scripts/data.json");
  const data = normalizeScatterplotData(rawData);

  chartInstance?.destroy();
  chartInstance = createScatterplot({
    container,
    data,
    options: {
      onNodeClick: (datum, context) => openModal(datum, {
        anchorElement: context.element
      }),
      ...config.options
    }
  });

  return chartInstance;
}

export function renderProjectChart(data, options = {}) {
  const container = options.container ?? document.querySelector("[data-scatterplot]") ?? document.getElementById("chart");
  const normalizedData = normalizeScatterplotData(data);

  if (chartInstance) {
    chartInstance.updateData(normalizedData);
    return chartInstance;
  }

  chartInstance = createScatterplot({
    container,
    data: normalizedData,
    options: {
      onNodeClick: (datum, context) => openModal(datum, {
        anchorElement: context.element
      }),
      ...options
    }
  });

  return chartInstance;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initProjectChart());
} else {
  initProjectChart();
}
