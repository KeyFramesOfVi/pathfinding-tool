import React from 'react'
import PropTypes from 'prop-types'

const getWidth = (x1, x2, y1, y2) =>
  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))

const getTransform = (x1, x2, y1, y2) =>
  Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI

const Wall = props => (
  <div
    style={{
      transformOrigin: '0 100%',
      height: '2px',
      width: getWidth(props.x1, props.x2, props.y1, props.y2),
      background: '#000',
      position: 'absolute',
      transform: `rotate(${getTransform(
        props.x1,
        props.x2,
        props.y1,
        props.y2
      )}deg`,
      left: props.x1,
      top: props.y1
    }}
  />
)

Wall.propTypes = {
  x1 : PropTypes.number.isRequired,
  x2 : PropTypes.number.isRequired,
  y1 : PropTypes.number.isRequired,
  y2 : PropTypes.number.isRequired
}



export default Wall
