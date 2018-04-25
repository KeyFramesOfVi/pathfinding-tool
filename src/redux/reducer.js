import { combineReducers } from 'redux'
import nodes from './modules/nodes'
import edges from './modules/edges'
import walls from './modules/walls'
import length from './modules/length'
import height from './modules/height'
import start from './modules/start'
import goal from './modules/goal'
import borders from './modules/borders'
import path from './modules/path'
import counter from './modules/counter'

export default combineReducers({
  nodes,
  edges,
  walls,
  length,
  height,
  start,
  goal,
  borders,
  path,
  counter,
})
