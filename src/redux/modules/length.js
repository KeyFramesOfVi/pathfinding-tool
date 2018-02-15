export default (state = 0, action) => {
  if (action.type === 'SET_MAP_SIZE') {
    return action.length;
  }
  return state;
};
