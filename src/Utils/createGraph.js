import { createNodes, createEdges, createWall } from './graph'

const createGraph = (length, height, proximity, bufferSize) => {
  let walls = []
  const [nodes, edges] = createEdges(
    createNodes(length, height, proximity, walls)
  )

  walls = [
    createWall(1, 14, 631, 14, bufferSize),
    createWall(1, 14, 1, 554, bufferSize),
    createWall(631, 14, 631, 554, bufferSize),
    createWall(1, 554, 631, 554, bufferSize),
    createWall(205, 14, 205, 206, bufferSize),
    createWall(105, 206, 205, 206, bufferSize),
    createWall(102, 336, 205, 336, bufferSize),
    createWall(205, 336, 205, 554, bufferSize),
    createWall(422, 336, 422, 554, bufferSize),
    createWall(315, 336, 520, 336, bufferSize),
    createWall(315, 206, 422, 206, bufferSize),
    createWall(422, 14, 422, 206, bufferSize)
  ]

  return {
    nodes,
    edges,
    walls
  }
}

export { createGraph }
