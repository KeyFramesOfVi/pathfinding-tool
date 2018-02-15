import React, { Component } from 'react';


class StartMenu extends Component {
  render() {
    return (
      <div style={{float: 'right'}}>
        <button onClick={(evt) => {
          this.props.startSearch();
        }}
        >
          Start Search
        </button>
      </div>
    );
  }
}

export { StartMenu };