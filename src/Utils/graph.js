import { isPathObstructed, isWithinBorders, getNodeID } from './graph_utils'
import { getEuclidianDistance } from './common_utils'

const populateNeighbors = (nodes, length, height, proximity, walls) =>
  nodes.map(node => {
    const neighbors = []
    for (let x = node.x - proximity; x <= node.x + proximity; x += proximity) {
      for (
        let y = node.y - proximity;
        y <= node.y + proximity;
        y += proximity
      ) {
        if (!(x === node.x && y === node.y)) {
          if (
            isWithinBorders(x, y, length, height) &&
            !isPathObstructed(node.x, node.y, x, y, walls)
          ) {
            const id = getNodeID(x, y, nodes)
            if (id !== -1) {
              neighbors.push(id)
            }
          }
        }
      }
    }
    return { ...node, neighbors }
  })

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
  open: false
})

const createNodes = (length, height, proximity, walls) => {
  const l = length
  const h = height
  const p = proximity
  const xExcess = l % p === 0 ? p : l % p
  const yExcess = h % p === 0 ? p : h % p

  const nodes = []
  let index = 0
  for (let x = Math.floor(xExcess / 2); x < l; x += proximity) {
    for (let y = Math.floor(yExcess / 2); y < h; y += proximity) {
      nodes.push(createNode(index, x, y))
      index += 1
    }
  }
  return populateNeighbors(nodes, length, height, proximity, walls)
}

const isEdge = (currentEdge, edges) =>
  edges.some(
    edge =>
      (currentEdge.from === edge.from && currentEdge.to === edge.to) ||
      (currentEdge.from === edge.to && currentEdge.to === edge.from)
  )

const createEdge = (to, from, cost) => ({
  to,
  from,
  cost
})

const populateNodeEdges = (nodes, edges) => {
  const _nodes = nodes
  _nodes.forEach(node => {
    const _node = node
    node.neighbors.forEach(neighbor => {
      const currNeighbor = _nodes[neighbor]
      const edge = getEdge(_node, currNeighbor, edges)
      if (edge) {
        _node.nodeEdges = [...new Set([...node.nodeEdges, edge])]
        currNeighbor.nodeEdges = [
          ...new Set([...currNeighbor.nodeEdges, edge])
        ]
      }
    })
  })
  return _nodes
}

const createEdges = nodes => {
  const edges = []
  nodes.forEach(node => {
    node.neighbors.forEach(neighbor => {
      const currNeighbor = nodes[neighbor]
      const edge = createEdge(node.id, currNeighbor.id, 0)
      if (!isEdge(edge, edges)) {
        const cost = getEuclidianDistance(
          node.x,
          node.y,
          currNeighbor.x,
          currNeighbor.y
        )
        let multiplier = 1
        if (node.inBuffer) {
          multiplier += 20
        }
        if (currNeighbor.inBuffer) {
          multiplier += 20
        }
        edge.cost = multiplier * cost
        edges.push(edge)
      }
    })
  })
  return edges
}

const getEdge = (nodeA, nodeB, edges) =>
  edges.find(
    edge =>
      (edge.to === nodeA.id && edge.from === nodeB.id) ||
      (edge.from === nodeA.id && edge.to === nodeB.id)
  ) || null

/* Create Wall Functions */
const initBuffers = (x1, y1, x2, y2, bufferSize) => {
  let p1x
  let p1y
  let p2x
  let p2y
  let p3x
  let p3y
  let p4x
  let p4y
  if (y1 === y2) {
    p1x = x1 - bufferSize
    p1y = y1 + bufferSize
    p2x = x2 + bufferSize
    p2y = y2 + bufferSize
    p3x = x2 + bufferSize
    p3y = y2 - bufferSize
    p4x = x1 - bufferSize
    p4y = y1 - bufferSize
  } else if (x1 === x2) {
    p1x = x1 - bufferSize
    p1y = y1 - bufferSize
    p2x = x2 - bufferSize
    p2y = y2 + bufferSize
    p3x = x2 + bufferSize
    p3y = y2 + bufferSize
    p4x = x1 + bufferSize
    p4y = y1 - bufferSize
  }
  return [
    {
      p1x,
      p1y,
      p2x,
      p2y
    },
    {
      p2x,
      p2y,
      p3x,
      p3y
    },
    {
      p3x,
      p3y,
      p4x,
      p4y
    },
    {
      p4x,
      p4y,
      p1x,
      p1y
    }
  ]
}

const createWall = (firstX, firstY, secondX, secondY, bufferSize) => {
  let x1, y1, x2, y2
  if (firstX < secondX || (firstX === secondX && firstY < secondY)) {
    x1 = firstX
    y1 = firstY
    x2 = secondX
    y2 = secondY
  } else {
    x1 = secondX
    y1 = secondY
    x2 = firstX
    y2 = firstY
  }
  return {
    x1,
    y1,
    x2,
    y2,
    p1x: x1 - bufferSize,
    p2y: y2 + bufferSize,
    p3x: x2 + bufferSize,
    p4y: y1 - bufferSize,
    buffers: initBuffers(x1, y1, x2, y2, bufferSize)
  }
}

const updateDisplayWallBuffer = walls => {
  walls.forEach(wall => {
    wall.buffers.filter(
      buffer =>
        !isWithinBorders(buffer.x0, buffer.y0) &&
        !isWithinBorders(buffer.x1, buffer.y1) &&
        !isPathObstructed(buffer.x0, buffer.y0, buffer.x1, buffer.y1, walls)
    )
  })
}

export {
  populateNeighbors,
  createNode,
  createNodes,
  createEdge,
  createEdges,
  populateNodeEdges,
  getEdge,
  initBuffers,
  createWall,
  updateDisplayWallBuffer
}
