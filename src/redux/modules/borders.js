export default (state = {}, action) => {
  if (action.type === 'SET_BORDERS') {
    const xExcess = (action.length % action.proximity) === 0 ?
      action.proximity :
      action.length % action.proximity;
    const yExcess = (action.height % action.proximity) === 0 ?
      action.proximity :
      action.height % action.proximity;
    const x1 = Math.floor(xExcess / 2);
    const y1 = Math.floor(yExcess / 2);
    // Add by 31 instead of 30 because walls are displayed as 2px rather than 1px
    const x2 = x1 + (action.proximity * Math.floor((action.length - x1) / action.proximity)) + 31;
    const y2 = y1 + (action.proximity * Math.floor((action.height - y1) / action.proximity)) + 31;
    return {
      x1,
      y1,
      x2,
      y2,
    };
  }
  return state;
};
