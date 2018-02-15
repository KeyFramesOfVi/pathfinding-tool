import { getEdge } from './graph';
import { getCostTo, isPointInBuffer } from './graph_utils';
import {
  getEuclidianDistance,
  octileHeuristic,
  compare,
  pushUpdateF,
  pushUpdateH,
} from './common_utils';

const PriorityQueue = require('fastpriorityqueue');

const VISION_SENSOR = 90;
let costChange = false;

let open = new PriorityQueue(compare);
let closedList = [];


let HEIGHT = 0;
let PROXIMITY = 0;

const initializeState = (s, counter) => {
  const node = s;
  if (node.search !== counter) {
    node.g = Infinity;
  }
  node.search = counter;
};

const goalCondition = (current, goal) => {
  let node = current;
  while (node.next !== null && node.h === node.next.h +
    getCostTo(node, node.next)) {
    node = node.next;
  }
  return node === goal;
};

const Astar = (nodes, start, goal, counter) => {
  const _start = start;
  open = new PriorityQueue(compare);
  closedList = [];

  initializeState(start, counter);
  _start.parent = null;
  _start.g = 0;
  _start.h = octileHeuristic(_start, goal);
  _start.f = _start.g + _start.h;
  _start.priority = _start.f;
  open.add(_start);
  while (!open.isEmpty()) {
    const current = open.poll();
    if (goalCondition(current, goal)) {
      return current;
    }
    closedList.push(current);
    current.neighbors.forEach((neighbor) => {
      const currNeighbor = nodes[neighbor];
      initializeState(currNeighbor, counter);
      if (currNeighbor.g > current.g + getCostTo(current, currNeighbor)) {
        currNeighbor.g = current.g + getCostTo(current, currNeighbor);
        currNeighbor.h = octileHeuristic(currNeighbor, goal);
        currNeighbor.f = currNeighbor.g + currNeighbor.h;
        currNeighbor.priority = currNeighbor.f;
        currNeighbor.parent = current;
        pushUpdateF(open, currNeighbor);
        currNeighbor.open = true;
      }
    });
  }
  return null;
};

const buildPath = (current, start) => {
  let node = current;
  while (node !== start) {
    node.parent.next = node;
    node = node.parent;
  }
};

const updateCost = (from, to, edges, walls) => {
  const current = from;
  const neighbor = to;
  if (isPointInBuffer(current.x, current.y, walls)) {
    current.inBuffer = true;
  }
  if (isPointInBuffer(neighbor.x, neighbor.y, walls)) {
    neighbor.inBuffer = true;
  }
  const edge = getEdge(current, neighbor, edges);
  const distCost = getEuclidianDistance(current.x, current.y, neighbor.x, neighbor.y);
  let multiplier = 1;
  if (current.inBuffer) {
    multiplier += 20;
  }
  if (neighbor.inBuffer) {
    multiplier += 20;
  }
  edge.cost = multiplier * distCost;
  return edge.cost;
};

const update = (current, decreasedEdges, nodes, edges, walls) => {
  current.neighbors.forEach((neighbor) => {
    const currNeighbor = nodes[neighbor];
    const oldCost = getEdge(current, currNeighbor, edges).cost;
    const newCost = updateCost(current, currNeighbor, edges, walls);
    if (newCost < oldCost) {
      decreasedEdges.push([current, currNeighbor]);
      costChange = true;
    } else if (oldCost < newCost) {
      costChange = true;
    }
  });
};

const insertState = (current, next, pq) => {
  const node = current;
  if (node.h > getCostTo(node, next) + next.h) {
    node.h = getCostTo(node, next) + next.h;
    node.priority = node.h;
    node.next = null;
    node.support = next;
    pushUpdateH(pq, node);
  }
};

const reestablishConsistency = (nodes, decreasedEdges, pq) => {
  while (!pq.isEmpty()) {
    pq.poll();
  }
  decreasedEdges.forEach((decreasedEdge) => {
    insertState(decreasedEdge[0], decreasedEdge[1], pq);
  });
  while (!pq.isEmpty()) {
    const current = pq.poll();
    if (current.support.next !== null) {
      current.next = current.support;
    }
    current.neighbors.forEach((neighbor) => {
      insertState(current, nodes[neighbor], pq);
    });
  }
};


const observe = (current, nodes, edges, walls) => {
  const sensorRange = VISION_SENSOR / PROXIMITY;
  const decreasedEdges = [];
  const vertical = 1; // y by x axis for some
  const horizontal = Math.ceil(HEIGHT / PROXIMITY);
  costChange = false;
  const node = current;

  for (let i = 1; i <= sensorRange; i += 1) {
    const up = node.id + (i * vertical);
    const down = node.id - (i * vertical);
    const left = node.id - (i * horizontal);
    const right = node.id + (i * horizontal);
    const upRight = node.id + (i * vertical) + (i * horizontal);
    const upLeft = node.id + (i * vertical) - (i * horizontal);
    const downLeft = node.id - (i * vertical) - (i * horizontal);
    const downRight = node.id - (i * vertical) + (i * horizontal);
    if (up > 0 && up < nodes.length) {
      update(nodes[up], decreasedEdges, nodes, edges, walls);
    }
    if (down > 0 && down < nodes.length) {
      update(nodes[down], decreasedEdges, nodes, edges, walls);
    }
    if (left > 0 && left < nodes.length) {
      update(nodes[left], decreasedEdges, nodes, edges, walls);
    }
    if (right > 0 && right < nodes.length) {
      update(nodes[right], decreasedEdges, nodes, edges, walls);
    }
    if (upRight > 0 && upRight < nodes.length) {
      update(nodes[upRight], decreasedEdges, nodes, edges, walls);
    }
    if (upLeft > 0 && upLeft < nodes.length) {
      update(nodes[upLeft], decreasedEdges, nodes, edges, walls);
    }
    if (downLeft > 0 && downLeft < nodes.length) {
      update(nodes[downLeft], decreasedEdges, nodes, edges, walls);
    }
    if (downRight > 0 && downRight < nodes.length) {
      update(nodes[downRight], decreasedEdges, nodes, edges, walls);
    }
  }

  if (decreasedEdges.length > 0) {
    node.next = null;
    reestablishConsistency(nodes, decreasedEdges);
  }
  return costChange;
};

const observePath = (hght, prox, nodes, edges, walls, start, goal, path) => {
  let _start = start;
  const _goal = goal;
  let change = false;
  while (!change && (_start !== _goal)) {
    const t = _start;
    path.push(_start.id);
    _start = _start.next;
    t.next = null;
    // move agent
    change = observe(_start, nodes, edges, walls);
  }
  change = false;
};

const createAPath = (hght, prox, nodes, edges, walls, start, goal, path, counter) => {
  counter += 1;
  const _start = start;
  const _goal = goal;
  const current = Astar(nodes, _start, _goal, counter);
  if (current === null) {
    return null;
  }
  for (let i = 0; i < closedList.length; i += 1) {
    closedList[i].h = current.g + current.h - closedList[i].g;
  }
  buildPath(current, _start);
};

const startPath = (hght, prox, nodes, edges, walls, start, goal, path, counter) => {
  HEIGHT = hght;
  PROXIMITY = prox;

  let _start = start;
  const _goal = goal;
  observe(_start, nodes, edges, walls);
  for (let i = 0; i < nodes.length; i += 1) {
    nodes[i].search = 0;
    nodes[i].h = octileHeuristic(_start, _goal);
    nodes[i].next = null;
  }
  createAPath(hght, prox, nodes, edges, walls, start, goal, path);
};


const createPath = (hght, prox, nodes, edges, walls, start, goal) => {
  HEIGHT = hght;
  PROXIMITY = prox;

  let _start = start;
  const _goal = goal;
  const path = [];
  let counter = 0;
  let change = false;
  observe(_start, nodes, edges, walls);
  for (let i = 0; i < nodes.length; i += 1) {
    nodes[i].search = 0;
    nodes[i].h = octileHeuristic(_start, _goal);
    nodes[i].next = null;
  }

  while (_start !== _goal) {
    counter += 1;
    const current = Astar(nodes, _start, _goal, counter);
    if (current === null) {
      return null;
    }
    for (let i = 0; i < closedList.length; i += 1) {
      closedList[i].h = current.g + current.h - closedList[i].g;
    }
    buildPath(current, _start);
    while (!change && (_start !== _goal)) {
      const t = _start;
      path.push(_start.id);
      _start = _start.next;
      t.next = null;
      // move agent
      change = observe(_start, nodes, edges, walls);
    }
    change = false;
  }
  return path;
};

export { createPath, startPath, createAPath, observePath };
