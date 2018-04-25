import React, { Component } from 'react'
import PropTypes from 'prop-types'

class StartMenu extends Component {
  render() {
    return (
      <div style={{ float: 'right' }}>
        <button
          onClick={() => {
            this.props.startSearch()
          }}
        >
          Start Search
        </button>
      </div>
    )
  }
}

StartMenu.propTypes = {
  startSearch : PropTypes.func.isRequired
}

export default StartMenu
