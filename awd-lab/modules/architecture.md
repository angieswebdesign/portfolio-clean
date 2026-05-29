# AWD Lab Visualization Architecture

This directory turns the AWD Lab visualization work into portable modules. The modules can be mounted into any container, initialized after async content loads, and reused multiple times on one page.

## Module Boundaries

### Data Normalization

Owned by:

- `scatterplot/scatterplot-data.js`
- `surface-node/surface-node-data.js`

Responsibilities:

- Load or export module data.
- Normalize raw data into render-ready records.
- Define projection constants such as scatterplot y positions.
- Keep coordinates, labels, metadata, relationships, and state defaults outside rendering logic.

Data modules must not:

- Query DOM.
- Create DOM.
- Attach event listeners.
- Import rendering modules.

### DOM Mounting

Owned by:

- `createScatterplot()`
- `createSurfaceNodeMap()`

Responsibilities:

- Resolve a user-provided container.
- Inject or reuse module-scoped HTML.
- Store private instance state.
- Return a public API: `redraw()`, `updateData()`, `updateOptions()` where applicable, and `destroy()`.

Mounting code is the only layer that should know about host containers.

### Rendering

Owned by:

- `scatterplot/scatterplot.js`
- `surface-node/surface-node.js`

Responsibilities:

- Convert normalized data plus measured dimensions into DOM/SVG output.
- Preserve visual appearance and spatial logic.
- Avoid page-specific selectors.

Rendering functions should be pure whenever possible. When they must create DOM elements, they should receive all required inputs as arguments and avoid measuring layout internally.

### Measurement and Redraw Lifecycle

Owned by:

- `shared/visualization-utils.js`

Primary utility:

- `createRedrawController({ element, measure, render })`

Responsibilities:

- Own `ResizeObserver`.
- Coalesce redraws through `requestAnimationFrame`.
- Run measurement before rendering.
- Provide `schedule()`, `redrawNow()`, and `destroy()`.

Measurement logic must not live inside rendering functions. Modules provide a `measure()` callback to the redraw controller, then render from the resulting metrics.

### SVG Primitives

Owned by:

- `shared/svg-utils.js`

Responsibilities:

- Create SVG elements.
- Draw generic lines and polygons.
- Calculate triangle connector geometry.
- Render visualization-agnostic SVG primitives.

SVG utilities must not import scatterplot or surface-node modules.

### Interaction State

Owned by:

- `shared/interaction-engine.js`
- Public module events and callbacks

Responsibilities:

- Hover state.
- Active state.
- Sequential reveal.
- Surface/node motion behavior.
- Pointer/focus orchestration.

Interaction code may request changes through public callbacks or events, but it should not mutate private rendering internals. For example, scatterplot activation emits `scatterplot:node-select` and calls the configured `onNodeClick` callback with `{ datum, element, index }`.

### Animation Orchestration

Owned by:

- `shared/interaction-engine.js`
- CSS custom properties and module CSS files

Responsibilities:

- Timing of reveal behavior.
- Pointer-driven surface rotation.
- Hover/focus animation state.

Animation orchestration should not own data normalization, markup structure, or SVG geometry.

## Render Lifecycle

1. Consumer calls `createScatterplot()` or `createSurfaceNodeMap()`.
2. The module resolves the container and mounts scoped HTML.
3. Data is already normalized or normalized by the adapter before initialization.
4. The module creates a redraw controller.
5. The redraw controller measures the mounted container.
6. The module renders from `data + options + measured metrics`.
7. The module replaces only its own scoped DOM.
8. Interactions are bound after DOM/SVG output exists.

## Redraw Lifecycle

1. A container resize, data update, option update, image load, or public `redraw()` call schedules work.
2. `createRedrawController()` coalesces the work into one animation frame.
3. The module `measure()` callback reads layout.
4. The module render callback receives immutable metrics for that frame.
5. Rendering updates the module output.
6. Interaction bindings are refreshed only for the newly rendered elements.

Image-dependent modules wait for image decode and stable layout before first interaction setup. This prevents connector and node placement bugs caused by measuring aspect-ratio content too early.

## State Flow

```text
raw data
  -> data module normalization
  -> create module instance
  -> private instance state
  -> redraw controller measures container
  -> render from data + options + metrics
  -> public event/callback reports interaction
  -> adapter or consumer decides what to open/update
```

Private instance state should stay inside the module factory. Consumers communicate through public APIs and events.

## Dependency Graph

```text
scripts/chart.js
  -> modules/scatterplot/scatterplot.js
  -> modules/scatterplot/scatterplot-data.js
  -> scripts/modal.js

scripts/surface.js
  -> modules/surface-node/surface-node.js
  -> modules/surface-node/surface-node-data.js

modules/scatterplot/scatterplot.js
  -> modules/shared/visualization-utils.js
  -> modules/shared/svg-utils.js

modules/surface-node/surface-node.js
  -> modules/shared/visualization-utils.js
  -> modules/shared/interaction-engine.js

scripts/modal.js
  -> modules/shared/svg-utils.js
  -> modules/shared/visualization-utils.js
```

There is no dependency from scatterplot to surface-node or from surface-node to scatterplot.

During migration, page-level scripts in `scripts/` are thin adapters. They can import modules and existing page overlays, but reusable modules must not import page adapters.

## Initialization Sequence

### Scatterplot

```js
import { createScatterplot } from "./modules/scatterplot/scatterplot.js";
import {
  loadScatterplotData,
  normalizeScatterplotData
} from "./modules/scatterplot/scatterplot-data.js";

const data = normalizeScatterplotData(await loadScatterplotData("./scripts/data.json"));

const chart = createScatterplot({
  container: document.querySelector("[data-scatterplot]"),
  data,
  options: {
    onNodeClick: (datum, context) => {
      console.log(datum, context.element);
    }
  }
});
```

### Surface Node Map

```js
import { createSurfaceNodeMap } from "./modules/surface-node/surface-node.js";
import { surfaceNodeData } from "./modules/surface-node/surface-node-data.js";

const surface = createSurfaceNodeMap({
  container: document.querySelector("[data-surface-node-map]"),
  data: surfaceNodeData,
  options: {
    assetBaseUrl: "./"
  }
});
```

## Public APIs

Each module returns an instance object.

Scatterplot:

- `element`
- `svg`
- `dots`
- `redraw()`
- `updateData(nextData)`
- `updateOptions(nextOptions)`
- `destroy()`

Surface node map:

- `element`
- `surface`
- `nodes`
- `redraw()`
- `updateData(nextData)`
- `destroy()`

## Future Extension Points

- Filters: normalize filter state outside rendering, then call `updateData()` or `updateOptions()`.
- Zoom/pan: add a shared viewport transform utility, then pass transform metrics into render functions.
- Dynamic API data: fetch externally, normalize in data modules, then update existing instances.
- Theme switching: override scoped CSS custom properties on `.sp-scatterplot` or `.sn-surface-node`.
- React/Vue wrappers: wrappers should call the module factories in lifecycle hooks and communicate through public APIs.
- Accessibility improvements: extend interaction engine and module event payloads without coupling modules to page overlays.
- Additional visualization layers: create a new module folder that imports only shared utilities and its own data/config.

## Boundary Rules

- Data modules never import DOM/rendering modules.
- Rendering functions do not perform layout measurement.
- Measurement is centralized through `createRedrawController()`.
- Interaction state communicates through callbacks/events.
- SVG helper functions stay visualization-agnostic.
- Module CSS is namespaced: `.sp-*`, `.sn-*`, or `.viz-*`.
- Page-specific compatibility stays in `scripts/` adapters and should shrink over time.
