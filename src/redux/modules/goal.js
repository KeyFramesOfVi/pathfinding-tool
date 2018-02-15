import { isPointInBuffer } from '../../Utils/graph_utils';

export default (state = null, action) => {
  if (action.type === 'SET_GOAL') {
    return action.nodes[action.time][action.nodes[action.time].length - 1];
  } else if (action.type === 'DRAG_ENTER_GOAL_NODE') {
    const node = action.nodes[action.id];
    if (!isPointInBuffer(node.x, node.y, action.walls)) {
      return action.nodes[action.id];
    }
  }

  return state;
};
