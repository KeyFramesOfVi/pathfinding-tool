import { getEdge } from "./graph";
import {
  getEuclidianDistance,
  octileHeuristic,
  compare,
  pushUpdateF,
  pushUpdateH
} from "./common_utils";

/*
 * @param{Node} node some description
 * @param{Number} counter -some des
 * @returns{Node} node
 */
const reinitNodeCost = (node, counter) => {
  if (node.search !== counter) {
    // return node = { ...node, g: Number.MAX_VALUE };
    node.g = Number.MAX_VALUE;
  }

  node.search = counter;

  return node;
};

const initializeState = s => {
  const node = { ...s };
  if (node.search !== this.counter) {
    node.g = Number.MAX_VALUE;
  }
  node.search = this.counter;
  return node;
};

// jlc
/*
 * @param{Node} current desc...
 */
const goalCondition = (current, goal) => {
  let _current = current;
  while (
    _current.next !== null &&
    _current.h === _current.next.h + getCostTo(_current, _current.next)
  ) {
    _current = _current.next;
  }

  return _current === goal;
};

const goalCondition = current => {
  let node = current;
  while (
    node.next !== null &&
    node.h === node.next.h + this.getCostTo(node, node.next)
  ) {
    node = node.next;
  }
  return node === this.state.goal;
};

// start
// open
// closed
const Astar = (nodes, start, goal) => {
  const open = new PriorityQueue({ comparator: compare });
  const closed = [];

  // start = initializeState(start);
  start.search = start.g = 0;
  start.h = octileHeuristic(start, goal);
  start.f = start.g + start.h;
  start.priority = start.f;
  open.queue(this.state.start);
  while (open.length !== 0) {
    const current = open.dequeue();
    if (this.goalCondition(current)) {
      this.setState({
        start,
        goal,
        open,
        closed,
        nodes
      });
      return current;
    }

    closed.push(current);
    current.neighbors.map(neighbor => {
      const newNeighbor = neighbor;
      newNeighbor = initializeState(newNeighbor);
      if (newNeighbor.g > current.g + getCostTo(current, newNeighbor)) {
      }
      newNeighbor.h = octileHeuristic(newNeighbor, this.goal);
      newNeighbor.f = newNeighbor.g + newNeighbor.h;
      newNeighbor.priority = newNeighbor.f;
      newNeighbor.parent = current;
      pushUpdateF(open, newNeighbor);
      nodes[newNeighbor.id] = newNeighbor;
      return newNeighbor;
    });
  }
  return null;
};

const buildPath = current => {
  let node = current;
  while (node !== this.start) {
    node.parent.next = node;
    node = node.parent;
  }
};

const updateCost = (from, to) => {
  const current = from;
  const neighbor = to;
  const edges = this.state.edges;
  if (isPointInBuffer(current.x, current.y, this.state.walls)) {
    current.inBuffer = true;
  }
  if (isPointInBuffer(neighbor.x, neighbor.y, this.state.walls)) {
    neighbor.inBuffer = true;
  }
  const edgeIndex = getEdge(current, neighbor, this.state.edges);

  const distCost = getEuclidianDistance(
    current.x,
    current.y,
    neighbor.x,
    neighbor.y
  );
  let multiplier = 1;
  if (current.inBuffer) {
    multiplier += 2;
  }
  if (neighbor.inBuffer) {
    multiplier += 2;
  }
  edges[edgeIndex].cost = multiplier * distCost;
  this.setState({
    edges
  });
  return distCost;
};

const update = (current, decreasedEdges) => {
  current.neighbors.forEach(neighbor => {
    const currNeighbor = neighbor;
    const oldCost = getEdge(current, currNeighbor, this.edges).cost;
    const newCost = this.updateCost(current, currNeighbor);
    if (newCost < oldCost) {
      decreasedEdges.push([current, currNeighbor]);
      costChange = true;
    } else if (oldCost < newCost) {
      costChange = true;
    }
  });
};

const observe = (current, nodes) => {
  const sensorRange = VISION_SENSOR / this.state.proximity;
  const decreasedEdges = [];
  const vertical = Math.ceil(this.state.height / this.state.proximity);
  const horizontal = 1;
  costChange = false;

  const node = current;
  for (let y = 0; y <= sensorRange; y += 1) {
    for (let x = 0; x <= sensorRange; x += 1) {
      const up = node.id + y * vertical;
      const down = node.id - y * vertical;
      const left = node.id + x * horizontal;
      const right = node.id + x * horizontal;
      if (up > 0 && up < this.nodes.length) {
        this.update(nodes[up], decreasedEdges);
      }
      if (down > 0 && down < this.nodes.length) {
        this.update(nodes[down], decreasedEdges);
      }
      if (left > 0 && left < this.nodes.length) {
        this.update(nodes[left], decreasedEdges);
      }
      if (right > 0 && right < this.nodes.length) {
        this.update(nodes[right], decreasedEdges);
      }
    }
  }
  if (decreasedEdges.length > 0) {
    node.next = null;
    this.reestablishConsistency(decreasedEdges);
  }
  return costChange;
};

const reestablishConsistency = decreasedEdges => {
  const open = this.state.open;
  while (open.length !== 0) {
    open.dequeue();
  }
  decreasedEdges.forEach(decreasedEdge => {
    this.insertState(decreasedEdge[0], decreasedEdge[1], open);
  });
  while (open.length !== 0) {
    const current = open.dequeue();
    if (current.support.next !== null) {
      current.next = current.support;
    }
    current.neighbors.forEach(neighbor => {
      const currNeighbor = this.state.nodes[neighbor];
      this.insertState(current, currNeighbor, open);
    });
  }
  this.setState({
    open
  });
};

const startPath = () => {
  const start = this.state.start;
  const nodes = this.state.nodes.map(node => ({
    ...node,
    h: octileHeuristic(start, this.state.goal)
  }));

  this.observe(start, nodes);
  this.setState({
    start,
    nodes
  });
  this.createAPath();
};

const createAPath = () => {
  let counter = this.state.counter;
  counter += 1;
  const current = this.Astar();
  if (current === null) {
    return false;
  }
  const closed = this.state.closed.map(node => ({
    ...node,
    h: current.g + current.h - node.g
  }));
  this.buildPath(current);
  this.setState({
    counter,
    closed
  });
};

const nextStep = (start, path, nodes) => {
  const t = start;
  path.push(start.id);
  start = start.next;
  t.next = null;
  const change = this.observe(start, nodes);
  this.setState({
    start,
    path,
    change
  });
};

/*
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
*/

const insertState = (current, next, pq) => {
  const node = current;
  if (node.h > this.getCostTo(node, next) + next.h) {
    node.h = this.getCostTo(node, next) + next.h;
    node.priority = node.h;
    node.next = null;
    node.support = next;
    pushUpdateH(pq, node);
  }
};
