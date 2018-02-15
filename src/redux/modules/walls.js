import { createWall } from '../../Utils/graph';


export default (state = [], action) => {
  if (action.type === 'CREATE_MAP_BORDER') {
    const {
      x1,
      y1,
      x2,
      y2,
    } = action.borders;
    return [
      createWall(1, 14, 632, 14, action.bufferSize),
      createWall(1, 14, 1, 555, action.bufferSize),
      createWall(632, 14, 632, 555, action.bufferSize),
      createWall(1, 555, 632, 555, action.bufferSize),
      createWall(205, 14, 205, 206, action.bufferSize),
      createWall(105, 206, 205, 206, action.bufferSize),
      createWall(102, 336, 207, 336, action.bufferSize),
      createWall(205, 336, 205, 555, action.bufferSize),
      createWall(422, 336, 422, 555, action.bufferSize),
      createWall(315, 336, 520, 336, action.bufferSize),
      createWall(315, 206, 422, 206, action.bufferSize),
      createWall(422, 14, 422, 206, action.bufferSize),
    ];
    // return [
    //   createWall(x1, y1, x2, y1, action.bufferSize),
    //   createWall(x1, y1, x1, y2, action.bufferSize),
    //   createWall(x2, y1, x2, y2, action.bufferSize),
    //   createWall(x1, y2, x2, y2, action.bufferSize),
    // ];
  } else if (action.type === 'CREATE_WALL') {
    return [...state, createWall(
      action.x1,
      action.y1,
      action.x2,
      action.y2,
      action.bufferSize,
    )];
  } else if (action.type === 'CREATE_PATH') {
    return action.walls;
  }

  return state;
};
