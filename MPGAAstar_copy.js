const PriorityQueue = require('js-priority-queue');

const smallCost = 1;
const diagCost = Math.sqrt(2 * smallCost * smallCost);

const VISION_SENSOR = 120;

/* UTILS FUNCTIONS */
const getEuclidianDistance = (x0, y0, x1, y1) => (
  Math.sqrt(((x0 - x1) ** 2) + ((y0 - y1) ** 2))
);

const octileHeuristic = (nodeA, nodeB) => {
  const dx = Math.abs(nodeA.x - nodeB.x);
  const dy = Math.abs(nodeA.y - nodeB.y);
  return (Math.min(dx, dy) * diagCost) + ((Math.max(dx, dy) - Math.min(dx, dy)) * smallCost);
};

const compare = (a, b) => {
  if (a.priority > b.priority) {
    return true;
  } else if (a.priority < b.priority) {
    return false;
  } else if (a.f > b.f) {
    return true;
  } else if (a.g > b.g) {
    return true;
  } else if (a.h > b.h) {
    return true;
  }
  return false;
};

const pushUpdateF = (pq, n) => {
  const l = [];
  let found = false;
  while (pq.length !== 0) {
    const tmp = pq.dequeue();
    if (tmp.id === n.id) {
      found = true;
      if (tmp.f < n.f) {
        pq.queue(tmp);
      } else {
        pq.queue(n);
      }
      break;
    }
    l.push(tmp);
  }
  while (l.length !== 0) {
    pq.queue(l.shift());
  }
  if (!found) {
    pq.queue(n);
  }
};

const pushUpdateH = (pq, n) => {
  const l = [];
  let found = false;
  while (pq.length !== 0) {
    const tmp = pq.dequeue();
    if (tmp.id === n.id) {
      found = true;
      if (tmp.h < n.h) {
        pq.queue(tmp);
      } else {
        pq.queue(n);
      }
      break;
    }
    l.push(tmp);
  }
  while (l.length !== 0) {
    pq.queue(l.shift());
  }
  if (!found) {
    pq.queue(n);
  }
};

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
  const s = (-s1y * (p0x - p2x) + s1x * (p0y - p2y)) / (-s2x * s1y + s1x * s2y);
  const t = ( s2x * (p0y - p2y) - s2y * (p0x - p2x)) / (-s2x * s1y + s1x * s2y);

  /* Collision detected */
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return true;
  }
  /* No collision */
  return false;
};


/* Neighbor Functions */
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


const isPointInBuffer = (x, y, walls) => {
  walls.some(wall => (
    x >= wall.p1x &&
    x <= wall.p3x &&
    y <= wall.p2y &&
    y >= wall.p4y
  ));
};

const isWithinBorders = (x, y, length, height) => (
  (x > 0 && x < length && y > 0 && y < height)
);

/* CREATE NODE FUNCTIONS */
const createNode = (id, x, y) => ({
  id,
  x,
  y,
  inBuffer: false,
  nodeEdges: {},
  search: 0,
  g: 0,
  h: 0,
  f: 0,
  priority: 0,
  parent: null,
  next: null,
  support: null,
});

const getNodeID = (x, y, nodes) => {
  const nodeID = nodes.filter(node => (
    node.x === x && node.y === y
  ));
  return nodeID.length > 0 ? nodeID[0].id : -1;
};

const populateNeighbors = (nodes, length, height, proximity, walls) => (
  nodes.map((node) => {
    const neighbors = [];
    for (let x = (node.x - proximity); x <= node.x + proximity; x += proximity) {
      for (let y = (node.y - proximity);
        y <= node.y + proximity;
        y += proximity) {
        if (!(x === node.x && y === node.y)) {
          if (isWithinBorders(x, y, length, height) &&
             !isPathObstructed(node.x, node.y, x, y, walls)) {
            neighbors.push(getNodeID(x, y, nodes));
          }
        }
      }
    }
    return { ...node, neighbors };
  })
);

const createNodes = (length, height, proximity, walls) => {
  const l = length;
  const h = height;
  const p = proximity;
  const xExcess = (l % p) === 0 ? p : l % p;
  const yExcess = (h % p) === 0 ? p : h % p;

  const nodes = [];
  let index = 0;
  for (let y = Math.floor(yExcess / 2); y < h; y += proximity) {
    for (let x = Math.floor(xExcess / 2); x < l; x += proximity) {
      nodes.push(createNode(index, x, y));
      index += 1;
    }
  }
  return populateNeighbors(nodes, length, height, proximity, walls);
};

const createEdge = (to, from, cost) => ({
  to,
  from,
  cost,
});

const getEdge = (nodeA, nodeB, edges) => (
  edges.find(edge => (
    (edge.to === nodeA.id && edge.from === nodeB.id) ||
    (edge.from === nodeA.id && edge.to === nodeB.id)
  )) || createEdge(-1, -1, -1)
);

/* Create Wall Functions */
const initBuffers = (x0, y0, x1, y1, bufferSize) => {
  let p1x;
  let p1y;
  let p2x;
  let p2y;
  let p3x;
  let p3y;
  let p4x;
  let p4y;
  if (y0 === y1) {
    p1x = x0 - bufferSize;
    p1y = y0 + bufferSize;
    p2x = x1 + bufferSize;
    p2y = y1 + bufferSize;
    p3x = x1 + bufferSize;
    p3y = y1 - bufferSize;
    p4x = x0 - bufferSize;
    p4y = y0 - bufferSize;
  } else if (x0 === x1) {
    p1x = x0 - bufferSize;
    p1y = y0 - bufferSize;
    p2x = x1 - bufferSize;
    p2y = y1 + bufferSize;
    p3x = x1 + bufferSize;
    p3y = y1 + bufferSize;
    p4x = x0 + bufferSize;
    p4y = y0 - bufferSize;
  }
  return [
    {
      x0: p1x,
      y0: p1y,
      x1: p2x,
      y1: p2y,
    },
    {
      x0: p2x,
      y0: p2y,
      x1: p3x,
      y1: p3y,
    },
    {
      x0: p3x,
      y0: p3y,
      x1: p4x,
      y1: p4y,
    },
    {
      x0: p4x,
      x1: p4y,
      y0: p1x,
      y1: p1y,
    },
  ];
};

const createWall = (x1, y1, x2, y2, bufferSize) => ({
  x1,
  y1,
  x2,
  y2,
  buffers: initBuffers(x1, y1, x2, y2, bufferSize),
});


const updateDisplayWallBuffer = (walls) => {
  walls.forEach((wall) => {
    wall.buffers.filter(buffer => (
      !isWithinBorders(buffer.x0, buffer.y0) && !isWithinBorders(buffer.x1, buffer.y1)
        && !isPathObstructed(buffer.x0, buffer.y0, buffer.x1, buffer.y1, walls)
    ));
  });
};


/* MPGAAStar Class */


class MPGAAstar {
  constructor(length, height, proximity) {
    this.length = length;
    this.height = height;
    this.bufferSize = 30;
    this.proximity = proximity;
    this.walls = [
      createWall(0, 0, 602, 0, this.bufferSize),
      createWall(0, 0, 0, 538, this.bufferSize),
      createWall(602, 0, 602, 538, this.bufferSize),
      createWall(0, 538, 602, 538, this.bufferSize),
      createWall(205, 0, 205, 206, this.bufferSize),
      createWall(105, 206, 205, 206, this.bufferSize),
      createWall(102, 336, 205, 336, this.bufferSize),
      createWall(205, 336, 205, 538, this.bufferSize),
      createWall(422, 336, 422, 538, this.bufferSize),
      createWall(315, 336, 520, 336, this.bufferSize),
      createWall(315, 206, 422, 206, this.bufferSize),
      createWall(422, 0, 422, 206, this.bufferSize),
      // createWall(20, 0, 20, 60),
      // createWall(95, 326, 305, 346),
      // createWall(305, 326, 305, 346),
      // createWall(530, 326, 530, 346),
      // createWall(305, 196, 305, 216),
    ];
    this.nodes = createNodes(length, height, proximity, this.walls);
    this.edges = this.createEdges();
    updateDisplayWallBuffer(this.walls);
    this.counter = 0;
    this.createEdges = this.createEdges.bind(this);
    this.initializeState = this.initializeState.bind(this);
    this.createPath = this.createPath.bind(this);
    this.getCostTo = this.getCostTo.bind(this);
    this.Astar = this.Astar.bind(this);
    this.costChange = false;
    this.open = null;
    this.closed = [];
    this.path = [];
    this.start = null;
    this.goal = null;
  }

  createEdges() {
    const [...nodes] = this.nodes;
    const edges = [];
    for (let i = 0; i < nodes.length; i += 1) {
      this.nodes[i].neighbors.forEach((neighbor) => {
        const edge = createEdge(i, neighbor, 0);
        const cost = getEuclidianDistance(
          nodes[i].x,
          nodes[i].y,
          nodes[neighbor].x,
          nodes[neighbor].y,
        );
        let multiplier = 1;
        if (nodes[i].inBuffer) {
          multiplier += 2;
        }
        if (nodes[neighbor].inBuffer) {
          multiplier += 2;
        }
        edge.cost = multiplier * cost;
        edges.push(edge);
        nodes[i].nodeEdges = [...nodes[i].nodeEdges, edge];
        nodes[neighbor].nodeEdges = [...nodes[neighbor].nodeEdges, edge];
      });
    }
    this.nodes = nodes;
    return edges;
  }

  initializeState(s) {
    const node = s;
    if (node.search !== this.counter) {
      node.g = Number.MAX_VALUE;
    }
    node.search = this.counter;
  }

  goalCondition(current) {
    let node = current;
    while (node.next !== null && node.h === node.next.h +
      this.getCostTo(node, node.next)) {
      node = node.next;
    }
    return node === this.goal;
  }

  Astar() {
    this.initializeState(this.start);
    this.start.parent = null;
    this.start.g = 0;
    this.start.h = octileHeuristic(this.start, this.goal);
    this.start.f = this.start.g + this.start.h;
    this.start.priority = this.start.f;
    this.open = new PriorityQueue({ comparator: compare });
    this.open.queue(this.start);
    this.closed = [];
    while (this.open.length !== 0) {
      const current = this.open.dequeue();
      if (this.goalCondition(current)) {
        return current;
      }
      this.closed.push(current);
      const [...neighbors] = current.neighbors;
      neighbors.forEach((neighbor) => {
        const currNeighbor = this.nodes[neighbor];
        this.initializeState(currNeighbor);
        if (currNeighbor.g > current.g + this.getCostTo(current, neighbor)) {
          currNeighbor.g = current.g + this.getCostTo(current, neighbor);
          currNeighbor.h = octileHeuristic(currNeighbor, this.goal);
          currNeighbor.f = currNeighbor.g + currNeighbor.h;
          currNeighbor.priority = currNeighbor.f;
          currNeighbor.parent = current;
          pushUpdateF(this.open, currNeighbor);
        }
      });
    }
    return null;
  }

  buildPath(current) {
    let node = current;
    while (node !== this.start) {
      node.parent.next = node;
      node = node.parent;
    }
  }

  updateCost(from, to) {
    const current = from;
    const neighbor = to;
    if (isPointInBuffer(current.x, current.y, this.walls)) {
      current.inBuffer = true;
    }
    if (isPointInBuffer(neighbor.x, neighbor.y, this.walls)) {
      neighbor.inBuffer = true;
    }
    const edge = getEdge(current, neighbor, this.edges);

    const distCost = getEuclidianDistance(current.x, current.y, neighbor.x, neighbor.y);
    let multiplier = 1;
    if (current.inBuffer) {
      multiplier += 2;
    }
    if (neighbor.inBuffer) {
      multiplier += 2;
    }
    edge.cost = multiplier * distCost;
    return edge.cost;
  }

  update(current, decreasedEdges) {
    current.neighbors.forEach((neighbor) => {
      const currNeighbor = this.nodes[neighbor];
      const oldCost = getEdge(current, currNeighbor, this.edges).cost;
      const newCost = this.updateCost(current, currNeighbor);
      if (newCost < oldCost) {
        decreasedEdges.push([current, currNeighbor]);
        this.costChange = true;
      } else if (oldCost < newCost) {
        this.costChange = true;
      }
    });
  }

  observe(current) {
    const sensorRange = VISION_SENSOR / this.proximity;
    const decreasedEdges = [];
    const vertical = Math.ceil(this.height / this.proximity);
    const horizontal = 1;
    this.costChange = false;
    const node = current;
    for (let y = 0; y <= sensorRange; y += 1) {
      for (let x = 0; x <= sensorRange; x += 1) {
        const up = node.id + (y * vertical);
        const down = node.id - (y * vertical);
        const left = node.id + (x * horizontal);
        const right = node.id + (x * horizontal);
        if (up > 0 && up < this.nodes.length) {
          this.update(this.nodes[up], decreasedEdges);
        }
        if (down > 0 && down < this.nodes.length) {
          this.update(this.nodes[down], decreasedEdges);
        }
        if (left > 0 && left < this.nodes.length) {
          this.update(this.nodes[left], decreasedEdges);
        }
        if (right > 0 && right < this.nodes.length) {
          this.update(this.nodes[right], decreasedEdges);
        }
      }
    }
    if (decreasedEdges.length > 0) {
      node.next = null;
      this.reestablishConsistency(decreasedEdges);
    }
    return this.costChange;
  }

  reestablishConsistency(decreasedEdges) {
    while (this.open.length !== 0) {
      this.open.dequeue();
    }
    decreasedEdges.forEach((decreasedEdge) => {
      this.insertState(decreasedEdge[0], decreasedEdge[1], this.open);
    });
    while (this.open.length !== 0) {
      const current = this.open.dequeue();
      if (current.support.next !== null) {
        current.next = current.support;
      }
      current.neighbors.forEach((neighbor) => {
        const currNeighbor = this.nodes[neighbor];
        this.insertState(current, currNeighbor, this.open);
      });
    }
  }

  createPath(start, goal) {
    this.start = start;
    this.goal = goal;
    this.counter = 0;
    let change = false;
    for (let i = 0; i < this.nodes.length; i += 1) {
      this.nodes[i].h = octileHeuristic(this.start, this.goal);
    }
    this.observe(this.start);
    while (this.start !== this.goal) {
      this.counter += 1;
      const current = this.Astar(this.start);
      if (current === null) {
        return false;
      }
      for (let i = 0; i < this.closed.length; i += 1) {
        this.closed[i].h = (current.g + current.h) - this.closed[i].g;
      }
      this.buildPath(current);
      while (!change && (this.start !== this.goal)) {
        const t = this.start;
        this.path.push(this.start.id);
        this.start = this.start.next;
        t.next = null;
        // move agent, react boiez
        change = this.observe(this.start);
      }
      change = false;
    }
    return true;
  }

  insertState(current, next, pq) {
    const node = current;
    if (node.h > this.getCostTo(node, next) + next.h) {
      node.h = this.getCostTo(node, next) + next.h;
      node.priority = node.h;
      node.next = null;
      node.support = next;
      pushUpdateH(pq, node);
    }
  }

  getCostTo(current, neighbor) {
    return current.nodeEdges.find(nodeEdge => (
      (nodeEdge.to === current.id && nodeEdge.from === neighbor.id) ||
      (nodeEdge.from === current.id && nodeEdge.to === neighbor.id)
    )) || 0;
  }
}

const test = new MPGAAstar(602, 538, 30);
test.createPath(test.nodes[0], test.nodes[16]);
console.log(test.path);
