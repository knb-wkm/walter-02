import React, { Component } from "react";

// containers
import NavigationContainer from "./NavigationContainer";
import FileBoxContainer from "./FileBox";

class HomeContainer extends Component {
  constructor(props) {
    super(props);
    this.getDirId = this.getDirId.bind(this);
  }

  getDirId() {
    const params = new URLSearchParams(this.props.location.search);
    return (params.get("dir_id") === null) ?
      0 : params.get("dir_id");
  }

  render() {
    return (
      <div>
        <NavigationContainer />
        <FileBoxContainer dir_id={this.getDirId()} />
      </div>
    );
  }
}

export default HomeContainer;
