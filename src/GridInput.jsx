import React, { Component } from 'react'
import PropTypes from 'prop-types'

class GridInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lengthValue: '602',
      heightValue: '538'
    }
  }

  updateLengthValue = (evt) => {
    this.setState({
      lengthValue: evt.target.value
    })
  }

  updateHeightValue = (evt) => {
    this.setState({
      heightValue: evt.target.value
    })
  }

  render() {
    return (
      <div style={{ float: 'right' }}>
        <input
          value={this.state.lengthValue}
          onChange={evt => this.updateLengthValue(evt)}
        />
        <input
          value={this.state.heightValue}
          onChange={evt => this.updateHeightValue(evt)}
        />
        <button
          onClick={() => {
            this.props.createGraph(
              +this.state.lengthValue,
              +this.state.heightValue
            )
          }}
        >
          Create Graph
        </button>
      </div>
    )
  }
}

GridInput.propTypes = {
  createGraph : PropTypes.func.isRequired
}

export default GridInput
