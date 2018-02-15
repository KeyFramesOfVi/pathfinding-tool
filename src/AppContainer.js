import React, { Component } from 'react';
import * as cloneDeep from 'lodash/cloneDeep';
import { connect } from 'react-redux';

import { App } from './App';

import {
  startPath,
  createAPath,
  observePath,
} from './Utils/MPGAAstar';

let xStart = 0;
let yStart = 0;

class AppContainer extends Component {
  constructor(props) {
    super(props);

    this.dragStart = this.dragStart.bind(this);
    this.dragEnter = this.dragEnter.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.startSearch = this.startSearch.bind(this);
  }

  mouseDown(event) {
    xStart = event.clientX;
    yStart = event.clientY;
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
    if (this.props.nodes[this.props.time][event.target.id] === this.props.start) {
      event.dataTransfer.setData('text/plain', 'start');
    } else if (this.props.nodes[this.props.time][event.target.id] === this.props.goal) {
      event.dataTransfer.setData('text/plain', 'goal');
    } 
    event.dataTransfer.setDragImage(img, 99999, 99999);
  }

  dragEnter(event) {
    if (event.dataTransfer.getData('text/plain') === 'start') {
      if (event.target.className === 'state') {
        this.props.dragEnterStartNode(this.props.nodes, event.target.id, this.props.walls, this.props.time);
      }
    } else if (event.dataTransfer.getData('text/plain') === 'goal') {
      if (event.target.className === 'state') {
        this.props.dragEnterGoalNode(this.props.nodes, event.target.id, this.props.walls, this.props.time);
      }
    }
  }

  startSearch() {
    const height = this.props.height;
    const proximity = 30;
    const start = this.props.start;
    const goal = this.props.goal;
    const curr_node = this.props.start;
    let nodes = this.props.nodes;
    let edges = this.props.edges;
    let walls = this.props.walls;
    let current = this.props.current;
    let counter = 0;
    let time = this.props.time;

    let nodesStep = cloneDeep(nodes[time]);
    let edgesStep = cloneDeep(edges[time]);
    let wallsStep = cloneDeep(walls[time]);
    let currentStep = nodesStep[current[time].id];
    let goalStep = nodesStep[goal.id];
    startPath(
      height,
      proximity,
      nodesStep,
      edgesStep,
      wallsStep,
      currentStep,
      goalStep,
      counter,
    );
    counter += 1;
    nodes = [...nodes, nodesStep];
    edges = [...edges, edgesStep];
    walls = [...walls, wallsStep];
    current = [...current, currentStep];
    time += 1;

    let change = false;
    while (currentStep !== goalStep) {
      nodesStep = cloneDeep(nodes[time]);
      edgesStep = cloneDeep(edges[time]);
      wallsStep = cloneDeep(walls[time]);
      currentStep = nodesStep[current[time].id];
      goalStep = nodesStep[goal.id];
      if (!change) {
        [currentStep, nodesStep, edgesStep, change] = observePath(
          nodesStep,
          edgesStep,
          wallsStep,
          currentStep,
        );
      } else {
        createAPath(
          nodesStep,
          edgesStep,
          wallsStep,
          currentStep,
          goalStep,
          counter,
        );
        counter += 1;
        change = false;
      }
      nodes = [...nodes, nodesStep];
      edges = [...edges, edgesStep];
      walls = [...walls, wallsStep];
      current = [...current, currentStep];
      time += 1;
    }
    this.props.startSearch(nodes, edges, walls, current, time);
  }

  render() {
    return (
      <App
        length={this.props.length}
        height={this.props.height}
        walls={this.props.walls[this.props.time]}
        nodes={this.props.nodes[this.props.time]}
        edges={this.props.edges[this.props.time]}
        start={this.props.start ? this.props.start.id : -1}
        goal={this.props.goal ? this.props.goal.id : -1}
        current={this.props.current ? this.props.current[this.props.time].id : -1}
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
        startSearch={this.startSearch}
       />
    );
  }
}
export default connect(
  (state, { time }) => (
    {
      nodes: state.nodes,
      edges: state.edges,
      walls: state.walls,
      length: state.length,
      height: state.height,
      start: state.start,
      goal: state.goal,
      borders: state.borders,
      current: state.current,
      counter: state.counter,
      time: state.time,
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
        dispatch({ type: 'CREATE_EDGES', nodes: state.nodes[0] });
        state = getState();
        dispatch({ type: 'POPULATE_NODE_EDGES', edges: state.edges[0] });
        state = getState();
        dispatch({ type: 'SET_MAP_SIZE', length, height });
        state = getState();
        dispatch({
          type: 'SET_BORDERS',
          length,
          height,
          proximity: 30,
        });
        dispatch({ type: 'CREATE_MAP_BORDER', borders: state.borders, bufferSize: 30 });
        dispatch({ type: 'SET_START', nodes: state.nodes, time: state.time });
        dispatch({ type: 'SET_GOAL', nodes: state.nodes, time: state.time });
        state = getState();
        dispatch({ type: 'SET_CURRENT', start: state.start });
      }),
      dragEnterStartNode: (nodes, id, walls, time) => dispatch({
        type: 'DRAG_ENTER_START_NODE',
        nodes: nodes[time],
        id,
        walls: walls[time],
      }),
      dragEnterGoalNode: (nodes, id, walls, time) => dispatch({
        type: 'DRAG_ENTER_GOAL_NODE',
        nodes: nodes[time],
        id,
        walls: walls[time],
      }),

      createWall: (x1, y1, x2, y2) => dispatch({
        type: 'CREATE_WALL',
        x1,
        y1,
        x2,
        y2,
        bufferSize: 30,
      }),

      startSearch: (nodes, edges, walls, current, time) => dispatch({
        type: 'CREATE_PATH',
        nodes,
        edges,
        walls,
        current,
        time,
      }),
    }
  ),
)(AppContainer);
