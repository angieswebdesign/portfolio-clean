# AWD Lab Visualization Modules

Portable scatterplot and surface/node visualizations live in this directory. The old AWD Lab page now uses thin adapters in `scripts/chart.js` and `scripts/surface.js`; new projects should import the module factories directly.

## Files

```text
modules/
  architecture.md
  scatterplot/
    scatterplot.js
    scatterplot.css
    scatterplot.html
    scatterplot-data.js
  surface-node/
    surface-node.js
    surface-node.css
    surface-node.html
    surface-node-data.js
  shared/
    visualization-utils.js
    visualization-tokens.css
    svg-utils.js
    interaction-engine.js
  demo/
    index.html
```

## CSS Setup

Load shared tokens first, then the component CSS you need.

```html
<link rel="stylesheet" href="modules/shared/visualization-tokens.css" />
<link rel="stylesheet" href="modules/scatterplot/scatterplot.css" />
<link rel="stylesheet" href="modules/surface-node/surface-node.css" />
```

The modules are scoped with `.sp-scatterplot` and `.sn-surface-node` to avoid leaking styles into host pages.

## Scatterplot Usage

```js
import { createScatterplot } from "./modules/scatterplot/scatterplot.js";
import {
  loadScatterplotData,
  normalizeScatterplotData
} from "./modules/scatterplot/scatterplot-data.js";

const data = normalizeScatterplotData(await loadScatterplotData("./scripts/data.json"));

const scatterplot = createScatterplot({
  container: document.querySelector("#chart"),
  data,
  options: {
    onNodeClick: (datum, context) => {
      console.log("Selected", datum, context.element);
    }
  }
});
```

The scatterplot also emits `scatterplot:node-select` from its root element.

## Surface Node Usage

```js
import { createSurfaceNodeMap } from "./modules/surface-node/surface-node.js";
import { surfaceNodeData } from "./modules/surface-node/surface-node-data.js";

const surfaceNodeMap = createSurfaceNodeMap({
  container: document.querySelector("#surface"),
  data: surfaceNodeData,
  options: {
    assetBaseUrl: "./"
  }
});
```

Use `assetBaseUrl` when mounting from a page whose path differs from the original AWD Lab root.

## Public API

Both modules return an instance with:

- `element`
- `redraw()`
- `updateData(nextData)`
- `destroy()`

Scatterplot also exposes `svg`, `dots`, and `updateOptions(nextOptions)`.

Surface-node also exposes `surface` and `nodes`.

## Render Flow

1. The consumer imports a module factory.
2. Data is loaded and normalized outside rendering.
3. The factory mounts scoped HTML into the provided container.
4. `createRedrawController()` measures the container and schedules rendering.
5. Rendering receives data, options, and measured metrics.
6. Interaction bindings are attached to the rendered elements.
7. Public callbacks/events notify the host page.

## Redraw Lifecycle

Resize and manual redraws are centralized through `shared/visualization-utils.js`.

- `ResizeObserver` watches the module root.
- Redraws are coalesced through `requestAnimationFrame`.
- Measurement happens before render.
- Image-dependent modules wait for decoded images and stable bounds before first interaction setup.

## Migration Notes

- `scripts/chart.js` is now an adapter that loads data, normalizes it, creates a scatterplot, and connects node activation to the existing modal overlay.
- `scripts/surface.js` is now an adapter that mounts `createSurfaceNodeMap()` into the existing `.intro-viz` region.
- Existing modal and Layer 3 behavior remains page-specific during migration.
- New projects should avoid importing files from `scripts/`; import from `modules/` instead.

## Demo

Open:

```text
modules/demo/index.html
```

The demo mounts both visualizations without the AWD Lab page shell.
