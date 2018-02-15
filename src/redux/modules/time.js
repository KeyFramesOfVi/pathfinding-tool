export default (state = 0, action) => {
  if (
    action.type === 'CREATE_PATH' ||
    action.type === 'SET_TIME'
  ) {
    console.log(`Time: ${action.time}`);
    return action.time;
  }
  return state;
};
