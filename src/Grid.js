import React from 'react';
import { Node } from './Node';
import { Wall } from './Wall';
// import { Agent } from './Agent';

const Grid = props => (
  <div
    className='grid'
    onMouseDown={props.mouseDown}
    onMouseUp={props.mouseUp}
  >
    {props.nodes ? props.nodes.map(node => (
      <Node key={node.id}
        id={node.id}
        left={node.x}
        top={node.y}
        start={props.start === node}
        goal={props.goal === node}
        current={props.current ? true : false}
        open={node.open}
        f={node.f}
        g={node.g}
        h={node.h}
        inBuffer={node.inBuffer}
        dragStart={props.dragStart}
        dragEnter={props.dragEnter}
      />
    )) : null
    }
    {
      props.walls ? props.walls.map((wall, index) => (
        <Wall key={index}
          x1={wall.x1}
          x2={wall.x2}
          y1={wall.y1}
          y2={wall.y2}
          p1x={wall.p1x}
          p2y={wall.p2y}
          p3x={wall.p3x}
          p4y={wall.p4y}
          buffers={wall.buffers}
        />
      )) : null
    }
  </div>
);

export { Grid };
