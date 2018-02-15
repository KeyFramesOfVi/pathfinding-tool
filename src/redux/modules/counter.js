export default (state = 0, action) => {
  if (action.type === 'CREATE_PATH') {
    return state + 1;
  }
  return state;
};
