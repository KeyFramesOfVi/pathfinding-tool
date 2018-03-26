import React from 'react';

const Agent = (props) => (
  <div
    style={{
      display: 'block',
      'borderBottom': '14px solid transparent',
      'borderLeft': '10px solid red',
      overflow: 'hidden',
      position: 'absolute',
      left: props.location ? props.location.x + 11 : 0,
      top:  props.location ? props.location.y : 0,
    }}
  />
)

export { Agent };
