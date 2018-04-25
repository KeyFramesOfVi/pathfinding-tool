export default (state = [], action) => {
  if (action.type === 'CREATE_PATH') {
    return action.path
  }
  return state
}