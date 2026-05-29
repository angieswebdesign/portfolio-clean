export const scatterplotProjection = {
  complexityToY: {
    1: 1.0,
    2: 2.1,
    3: 3.4,
    4: 4.6,
    5: 5.3
  },
  yTicks: [1.0, 2.1, 3.4, 4.6, 5.3]
};

export async function loadScatterplotData(url = new URL("../../scripts/data.json", import.meta.url)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load scatterplot data: ${url}`);
  return response.json();
}

export function normalizeScatterplotData(data, projection = scatterplotProjection) {
  return data.map((item) => ({
    ...item,
    year: Number(item.year),
    yPos: item.yPos ?? projection.complexityToY[item.complexity]
  }));
}
