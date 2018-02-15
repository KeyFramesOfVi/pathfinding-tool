export default (state = 0, action) => {
  if (action.type === 'SET_MAP_SIZE') {
    return state;
  } else if (action.type === 'CREATE_PATH') {
    return action.time;
  }
  return state;
};
