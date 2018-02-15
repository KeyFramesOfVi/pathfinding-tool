import React, { Component } from 'react';
import { connect } from 'react-redux';

import { App } from './App';

import {
  startPath,
  createAPath,
  observePath,
  createPath,
} from './Utils/MPGAAstar';

let xStart = 0;
let yStart = 0;


// const length = 602;
// const height = 538;
// const proximity = 30;
// const bufferSize = 30;
// const {
//   nodes,
//   edges,
//   walls,
// } = createGraph(length, height);
// const start = nodes[2];
// const goal = nodes[310];
// const path = createPath(height, proximity, nodes, edges, walls, start, goal);

class AppContainer extends Component {
  constructor(props) {
    super(props);

    this.dragStart = this.dragStart.bind(this);
    this.dragOver = this.dragOver.bind(this);
    this.dragEnter = this.dragEnter.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
  }

  mouseDown(event) {
    xStart = event.clientX;
    yStart = event.clientY;
    console.log(`xBegin: ${xStart} yBegin:${yStart}`);
  }

  mouseUp(event) {
    if (event.target.className === 'state') {
      const xEnd = event.clientX;
      const yEnd = event.clientY;
      const xDiff = Math.abs(xStart - xEnd);
      const yDiff = Math.abs(yStart - yEnd);
      if (xDiff < yDiff) {
        this.props.createWall(xStart, yStart, xStart, yEnd);
      } else {
        this.props.createWall(xStart, yStart, xEnd, yStart);
      }
    }
  }
  dragStart(event) {
    const img = new Image();
    if (this.props.nodes[event.target.id] === this.props.start) {
      event.dataTransfer.setData('text/plain', 'start');
    } else if (this.props.nodes[event.target.id] === this.props.goal) {
      event.dataTransfer.setData('text/plain', 'goal');
    } 
    event.dataTransfer.setDragImage(img, -99999, -99999);
  }

  dragOver(event) {
    event.preventDefault();
    if (event.target.className === 'state') {
      event.dataTransfer.dropEffect = 'all';
    } else {
      event.dataTransfer.dropEffect = 'none';
    }
  }

  dragEnter(event) {
    event.preventDefault();
    if (event.dataTransfer.getData('text/plain') === 'start') {
      if (event.target.className === 'state') {
        this.props.dragEnterStartNode(this.props.nodes, event.target.id, this.props.walls);
      }
    } else if (event.dataTransfer.getData('text/plain') === 'goal') {
      if (event.target.className === 'state') {
        this.props.dragEnterGoalNode(this.props.nodes, event.target.id, this.props.walls);
      }
    }
  }

  drop(event) {
    event.preventDefault();
    if (!event.target.getAttribute('onDrop')) {
      return false;
    }
    console.log(event.target);
    if (event.target.className === 'grid') {
      const { xStart, yStart } = JSON.parse(event.dataTransfer.getData('startCoordinates'));
      const xEnd = event.target.tclientX;
      const yEnd = event.target.clientY;
      console.log(`xStart: ${xStart} yStart: ${yStart} xEnd: ${xEnd} yEnd: ${yEnd}`);
      const xDiff = Math.abs(xStart - xEnd);
      const yDiff = Math.abs(yStart - yEnd);
    }
  }

  render() {
    return (
      <App
        length={this.props.length}
        height={this.props.height}
        walls={this.props.walls}
        nodes={this.props.nodes}
        edges={this.props.edges}
        start={this.props.start}
        goal={this.props.goal}
        path={this.props.path}
        allowDrop={this.allowDrop}
        dragStart={this.dragStart}
        dragEnter={this.dragEnter}
        dragOver={this.dragOver}
        drop={this.drop}
        mouseDown={this.mouseDown}
        mouseUp={this.mouseUp}
        startCreateWall={this.props.startCreateWall}
        endCreateWall={this.props.endCreateWall}
        createGraph={this.props.createGraph}
        startSearch={this.props.startSearch}
       />
    );
  }
}
export default connect(
  state => (
    {
      nodes: state.nodes,
      edges: state.edges,
      walls: state.walls,
      length: state.length,
      height: state.height,
      start: state.start,
      goal: state.goal,
      borders: state.borders,
      path: state.path,
      counter: state.counter,
    }
  ),
  dispatch => (
    {
      createGraph: (length, height) => dispatch((dispatch, getState) => {
        let state = getState();
        dispatch({
          type: 'CREATE_NODES',
          length,
          height,
          proximity: 30,
          walls: state.walls,
        });
        state = getState();
        dispatch({ type: 'CREATE_EDGES', nodes: state.nodes });
        state = getState();
        dispatch({ type: 'POPULATE_NODE_EDGES', edges: state.edges });
        state = getState();
        dispatch({ type: 'SET_MAP_SIZE', length, height });
        state = getState();
        dispatch({
          type: 'SET_BORDERS',
          length,
          height,
          proximity: 30,
        });
        state = getState();
        dispatch({ type: 'CREATE_MAP_BORDER', borders: state.borders, bufferSize: 30 });
        dispatch({ type: 'SET_START', nodes: state.nodes });
        dispatch({ type: 'SET_GOAL', nodes: state.nodes });
      }),
      dragEnterStartNode: (nodes, id, walls) => dispatch({
        type: 'DRAG_ENTER_START_NODE',
        nodes,
        id,
        walls,
      }),
      dragEnterGoalNode: (nodes, id, walls) => dispatch({
        type: 'DRAG_ENTER_GOAL_NODE',
        nodes,
        id,
        walls,
      }),

      createWall: (x1, y1, x2, y2) => dispatch({
        type: 'CREATE_WALL',
        x1,
        y1,
        x2,
        y2,
        bufferSize: 30,
      }),

      startSearch: () => dispatch((dispatch, getState) => {
        const state = getState();
        const {
          height,
          nodes,
          edges,
          walls,
          start,
          goal,
          // path,
          // counter,
        } = state;
        // let finished = false;
        // while (!finished) {
        //   let notStarted = true;
        //   if (notStarted) {
        //     startPath(height, 30, nodes, edges, walls, start, goal, path, )
        //   }
        // }
        const path = createPath(height, 30, nodes, edges, walls, start, goal, path);
        dispatch({
          type: 'CREATE_PATH',
          nodes,
          edges,
          walls,
          path,
        });
      }),
    }
  ),
)(AppContainer);
