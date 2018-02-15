import React from 'react';
import { Grid } from './Grid';
import { GridInput } from './GridInput';
import { StartMenu } from './StartMenu';
import './App.css';

const App = props => (
  <div>
    <Grid
      length={props.length}
      height={props.height}
      walls={props.walls}
      nodes={props.nodes}
      edges={props.edges}
      start={props.start}
      goal={props.goal}
      path={props.path}
      dragStart={props.dragStart}
      dragEnter={props.dragEnter}
      mouseDown={props.mouseDown}
      mouseUp={props.mouseUp}
    />
    <GridInput
      createGraph={props.createGraph}
    />
    <StartMenu
      startSearch={props.startSearch}
    />
  </div>
);

export { App };
