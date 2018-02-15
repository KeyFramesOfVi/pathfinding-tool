export default (state = [], action) => {
  if (action.type === 'SET_CURRENT') {
    return [action.start];
  } else if (action.type === 'CREATE_PATH') {
    return action.current;
  }
  return state;
}
