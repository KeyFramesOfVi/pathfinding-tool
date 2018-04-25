import { createNodes, populateNodeEdges } from '../../Utils/graph'

export default (state = [], action) => {
  if (action.type === 'CREATE_NODES') {
    return createNodes(action.length, action.height, action.proximity, action.walls)
  } else if (action.type === 'POPULATE_NODE_EDGES') {
    return populateNodeEdges(state, action.edges)
  } else if (action.type === 'CREATE_PATH') {
    return action.nodes
  }
  return state
}
