import { isPointInBuffer } from '../../Utils/graph_utils'

export default (state = null, action) => {
  if (action.type === 'SET_START') {
    return action.nodes[0]
  } else if (action.type === 'DRAG_ENTER_START_NODE') {
    const node = action.nodes[action.id]
    if (!isPointInBuffer(node.x, node.y, action.walls)) {
      return action.nodes[action.id]
    }
  }

  return state
}
