export const SVG_NS = "http://www.w3.org/2000/svg";

export function createSvgElement(name, attributes = {}) {
  const element = document.createElementNS(SVG_NS, name);
  setAttributes(element, attributes);
  return element;
}

export function setAttributes(element, attributes = {}) {
  Object.entries(attributes).forEach(([name, value]) => {
    if (value === null || value === undefined) return;
    element.setAttribute(name, value);
  });
}

export function clearElement(element) {
  element.replaceChildren();
}

export function drawSvgLine(svg, { x1, y1, x2, y2, className, stroke, strokeWidth = 1 }) {
  const line = createSvgElement("line", {
    x1,
    y1,
    x2,
    y2,
    stroke,
    "stroke-width": strokeWidth
  });

  if (className) line.classList.add(className);
  svg.appendChild(line);
  return line;
}

export function drawSvgPolygon(svg, { points, className, fill }) {
  const polygon = createSvgElement("polygon", {
    points: points.map((point) => point.join(",")).join(" "),
    fill
  });

  if (className) polygon.classList.add(className);
  svg.appendChild(polygon);
  return polygon;
}

export function calculateTriangleConnector({ nodeRect, panelRect, overlayRect, minWedge = 4 }) {
  const nodeCenterX = nodeRect.left + nodeRect.width / 2;
  const nodeCenterY = nodeRect.top + nodeRect.height / 2;
  const panelHeight = panelRect.height;
  const anchorY = Math.max(0, Math.min(panelHeight, nodeCenterY - panelRect.top));
  const panelIsRightOfNode = panelRect.left > nodeRect.left;

  if (panelIsRightOfNode) {
    const width = panelRect.left - nodeCenterX;
    if (width <= minWedge) return null;

    return {
      left: panelRect.left - overlayRect.left - width,
      top: panelRect.top - overlayRect.top,
      width,
      height: panelHeight + 1,
      points: [
        [width, 0],
        [width, panelHeight],
        [0, anchorY]
      ]
    };
  }

  const width = nodeCenterX - panelRect.right;
  if (width <= minWedge) return null;

  return {
    left: panelRect.right - overlayRect.left,
    top: panelRect.top - overlayRect.top,
    width,
    height: panelHeight,
    points: [
      [0, 0],
      [0, panelHeight],
      [width, anchorY]
    ]
  };
}

export function renderTriangleConnector(svg, connector, fill) {
  if (!connector) {
    svg.replaceChildren();
    return null;
  }

  svg.style.left = `${Math.floor(connector.left)}px`;
  svg.style.top = `${Math.floor(connector.top)}px`;
  svg.style.width = `${connector.width}px`;
  svg.style.height = `${connector.height}px`;
  svg.setAttribute("viewBox", `0 0 ${connector.width} ${connector.height}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.replaceChildren();

  return drawSvgPolygon(svg, {
    points: connector.points,
    fill
  });
}
