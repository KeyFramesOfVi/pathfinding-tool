const getLineIntersection = (

  p0x,
  p0y,
  p1x,
  p1y,
  p2x,
  p2y,
  p3x,
  p3y,
) => {
  const s1x = p1x - p0x;
  const s1y = p1y - p0y;
  const s2x = p3x - p2x;
  const s2y = p3y - p2y;
  const s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) /
            (-s2x * s1y + s1x * s2y);
  const t = ( s2x * (p0y - p2y) - s2y * (p0x - p2x)) /
            (-s2x * s1y + s1x * s2y);

  /* Collision detected */
  return s >= 0 && s <= 1 && t >= 0 && t <= 1;
};

const isPathObstructed = (x1, y1, x2, y2, walls) => (
  walls.some(wall => (
    getLineIntersection(
      x1,
      y1,
      x2,
      y2,
      wall.x1,
      wall.y1,
      wall.x2,
      wall.y2,
    )
  ))
);

const isPointInBuffer = (x, y, walls) => (
  walls.some(wall => (
    x >= wall.p1x &&
    x <= wall.p3x &&
    y <= wall.p2y &&
    y >= wall.p4y
  ))
);

const isWithinBorders = (x, y, length, height) => (
  (x > 0 && x < length && y > 0 && y < height)
);

/* CREATE NODE FUNCTIONS */

const getNodeID = (x, y, nodes) => (
  nodes.find(node => (
    node.x === x && node.y === y
  )).id || -1
);

const getCostTo = (current, neighbor) => (
  current.nodeEdges.find(nodeEdge => (
    (nodeEdge.to === current.id && nodeEdge.from === neighbor.id) ||
    (nodeEdge.from === current.id && nodeEdge.to === neighbor.id)
  )).cost
);


export {
  getLineIntersection,
  isPathObstructed,
  isPointInBuffer,
  isWithinBorders,
  getNodeID,
  getCostTo,
};
