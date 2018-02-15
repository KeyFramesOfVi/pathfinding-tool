import { createEdges } from '../../Utils/graph';

export default (state = [], action) => {
  if (action.type === 'CREATE_EDGES') {
    return [...state, createEdges(action.nodes)];
  } else if (action.type === 'CREATE_PATH') {
    return action.edges;
  }
  return state;
};
