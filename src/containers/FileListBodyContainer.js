import React, { Component } from "react";

// store
import { connect } from "react-redux";

// components
import FileListBody from "../components/FileListBody";

// actions
import {
  addFile,
  moveFile,
  deleteFile,
  editFile,
  triggerSnackbar,
  toggleStar
} from "../actions";

class FileListBodyContainer extends Component {
  render() {
    return (
      <FileListBody
        dir_id={this.props.dir_id}
        files={this.props.files}
        addFile={this.props.addFile}
        moveFile={this.props.moveFile}
        deleteFile={this.props.deleteFile}
        editFile={this.props.editFile}
        triggerSnackbar={this.props.triggerSnackbar}
        toggleStar={this.props.toggleStar} />
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {};
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  addFile: (dir_id, file_name) => { dispatch(addFile(dir_id, file_name)); },
  moveFile: (dir_id, file_id) =>  { dispatch(moveFile(dir_id, file_id)); },
  deleteFile: (file) => { dispatch(deleteFile(file)); },
  editFile: (file) => { dispatch(editFile(file)); },
  triggerSnackbar: (message) => { dispatch(triggerSnackbar(message)); },
  toggleStar: (file) => { dispatch(toggleStar(file)); }
});

FileListBodyContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileListBodyContainer);

export default FileListBodyContainer;