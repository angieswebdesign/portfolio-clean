import {
  createRedrawController,
  createDisposables,
  resolveContainer,
  waitForStableRect
} from "../shared/visualization-utils.js";
import { createSvgElement } from "../shared/svg-utils.js";
import { scatterplotProjection } from "./scatterplot-data.js";

const DEFAULT_OPTIONS = {
  mobileBreakpoint: 480,
  desktop: {
    width: 900,
    height: 450
  },
  mobile: {
    width: 350,
    height: 600
  },
  margins: {
    top: 50,
    right: 48,
    bottom: 48,
    left: 48
  },
  dotColor: "#fa4d7f",
  dotRadius: (datum) => 18 + datum.complexity * 5,
  yDomain: [1, 5.3],
  yTicks: scatterplotProjection.yTicks,
  inset: 0,
  onNodeClick: null
};

const TEMPLATE = `
  <div class="sp-scatterplot" data-sp-root>
    <div class="sp-scatterplot__axis-labels" aria-hidden="true">
      <span>5</span>
      <span>4</span>
      <span>3</span>
      <span>2</span>
      <span>1</span>
    </div>
    <div class="sp-scatterplot__plot" role="img" aria-label="Design work timeline"></div>
    <div class="sp-scatterplot__x-axis">Year</div>
  </div>
`;

export function createScatterplot(config = {}) {
  const host = resolveContainer(config.container);
  const state = {
    host,
    root: null,
    plot: null,
    svg: null,
    data: [...(config.data ?? [])],
    options: mergeOptions(DEFAULT_OPTIONS, config.options),
    metrics: null,
    dots: new Map(),
    destroyed: false
  };

  const disposables = createDisposables();
  mountTemplate(state);

  const redrawController = createRedrawController({
    element: state.root,
    measure: () => measureScatterplot(state),
    render: (metrics) => {
      state.metrics = metrics;
      renderScatterplot(state, metrics);
    }
  });

  disposables.add(redrawController.destroy);
  redrawController.schedule();

  const api = {
    get element() {
      return state.root;
    },
    get svg() {
      return state.svg;
    },
    get dots() {
      return new Map(state.dots);
    },
    redraw() {
      redrawController.schedule();
    },
    updateData(nextData) {
      state.data = [...nextData];
      redrawController.schedule();
    },
    updateOptions(nextOptions) {
      state.options = mergeOptions(state.options, nextOptions);
      redrawController.schedule();
    },
    destroy() {
      state.destroyed = true;
      disposables.cleanup();
      state.host.replaceChildren();
      state.dots.clear();
    }
  };

  return api;
}

function mountTemplate(state) {
  const existingRoot = state.host.classList.contains("sp-scatterplot")
    ? state.host
    : state.host.querySelector(".sp-scatterplot");

  if (existingRoot) {
    state.root = existingRoot;
  } else {
    state.host.innerHTML = TEMPLATE;
    state.root = state.host.querySelector(".sp-scatterplot");
  }

  state.plot = state.root.querySelector(".sp-scatterplot__plot");

  if (!state.plot) {
    throw new Error("Scatterplot template is missing .sp-scatterplot__plot.");
  }
}

function renderScatterplot(state, dimensions) {
  if (state.destroyed || !state.plot || !dimensions) return;

  const { svg, dots } = createScatterplotSvg({
    data: state.data,
    dimensions,
    options: state.options
  });

  bindScatterplotInteractions(dots, (datum, context) => {
      state.root.dispatchEvent(new CustomEvent("scatterplot:node-select", {
        bubbles: true,
        detail: {
          datum,
          element: context.element,
          index: context.index
        }
      }));

      state.options.onNodeClick?.(datum, {
        ...context,
        instance: state
      });
  });

  state.dots = dots;
  state.svg = svg;
  state.plot.replaceChildren(svg);
}

export function createScatterplotSvg({ data, dimensions, options }) {
  const svg = createSvgElement("svg", {
    class: "sp-scatterplot__svg",
    role: "presentation",
    width: dimensions.width,
    height: dimensions.height,
    viewBox: `0 0 ${dimensions.width} ${dimensions.height}`
  });

  const domain = getDomains(data, options);
  const plotGroup = createSvgElement("g", { class: "sp-scatterplot__marks" });
  const dots = new Map();

  data.forEach((datum, index) => {
    const point = projectDatum(datum, dimensions, domain);
    const radius = options.dotRadius(datum);
    const circle = createSvgElement("circle", {
      class: "sp-scatterplot__dot",
      cx: point.x,
      cy: point.y,
      r: radius,
      fill: options.dotColor,
      "fill-opacity": datum.opacity ?? 1,
      tabindex: "0",
      role: "button",
      "aria-label": datum.heading?.title ?? datum.title ?? datum.id ?? `Scatterplot item ${index + 1}`
    });

    dots.set(datum.id ?? index, { element: circle, datum, index });
    plotGroup.appendChild(circle);
  });

  svg.appendChild(plotGroup);
  return { svg, dots };
}

function bindScatterplotInteractions(dots, onActivate) {
  dots.forEach(({ element, datum, index }) => {
    element.addEventListener("click", () => {
      onActivate?.(datum, {
        element,
        index
      });
    });

    element.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      onActivate?.(datum, {
        element,
        index
      });
    });
  });
}

function measureScatterplot(state) {
  const measuredWidth = state.plot.clientWidth || state.root.clientWidth;
  const isMobile = measuredWidth <= state.options.mobileBreakpoint || window.innerWidth <= state.options.mobileBreakpoint;
  const base = isMobile ? state.options.mobile : state.options.desktop;
  const width = measuredWidth ? Math.max(base.width, Math.min(measuredWidth, state.options.desktop.width)) : base.width;

  return {
    width,
    height: base.height,
    margins: state.options.margins
  };
}

function getDomains(data, options) {
  const years = data.map((datum) => Number(datum.year)).filter(Number.isFinite);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return {
    x: minYear === maxYear ? [minYear - 1, maxYear + 1] : [minYear, maxYear],
    y: options.yDomain
  };
}

function projectDatum(datum, dimensions, domain) {
  const { width, height, margins } = dimensions;
  const plotWidth = width - margins.left - margins.right;
  const plotHeight = height - margins.top - margins.bottom;
  const [minX, maxX] = domain.x;
  const [minY, maxY] = domain.y;
  const xRatio = (Number(datum.year) - minX) / (maxX - minX);
  const yRatio = (Number(datum.yPos) - minY) / (maxY - minY);

  return {
    x: margins.left + xRatio * plotWidth,
    y: margins.top + (1 - yRatio) * plotHeight
  };
}

function mergeOptions(base, override = {}) {
  return {
    ...base,
    ...override,
    desktop: {
      ...base.desktop,
      ...override.desktop
    },
    mobile: {
      ...base.mobile,
      ...override.mobile
    },
    margins: {
      ...base.margins,
      ...override.margins
    }
  };
}

export async function redrawAfterLayout(instance, element) {
  await waitForStableRect(element ?? instance.element);
  instance.redraw();
}
