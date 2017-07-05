import React, { Component } from "react";

// DnD
import withDragDropContext from "./withDragDropContext";
import { NativeTypes } from 'react-dnd-html5-backend';

// store
import { connect } from "react-redux";

// app components
import TableBodyWrapper from "./TableBodyWrapper";
import Dir from "./Dir";
import File from "./File";

// datetime
import moment from "moment";

class TableBody extends Component {
  constructor(props) {
    super(props);
    this.handleFileDrop = this.handleFileDrop.bind(this);
  }

  handleFileDrop(item, monitor) {
    if (monitor) {
      const droppedFiles = monitor.getItem().files;
      droppedFiles.forEach(file => {
        this.props.dispatch({
          type: "ADD_FILE",
          name: file.name,
          modified: moment().format("YYYY-MM-DD HH:mm"),
          owner: "user01",
          dir_id: this.props.dir_id,
          is_dir: false,
          is_display: true
        });

        this.props.addFilesDone(file);
      });
    }
  }

  render() {
    const { dir_id, files, dispatch, onDeleteDone, onMoveDone } = this.props;

    const renderRow = (file, idx) => {
      return file.is_dir 
        ? <Dir key={idx} dir={file} />
        : <File key={idx} dir_id={dir_id} file={file} onDeleteDone={onDeleteDone}
          moveFile={moveFile} onMoveDone={onMoveDone} />;
    };

    const { FILE } = NativeTypes;

    const moveFile = (file_id, dir_id) => {
      dispatch({
        type: "MOVE_FILE",
        file_id: file_id,
        dir_id: dir_id
      });
    };

    return (
      <TableBodyWrapper
        accepts={[FILE]}
        onDrop={this.handleFileDrop}>
        {files.map((file, idx) => renderRow(file, idx))}
      </TableBodyWrapper>
    );
  }
}

TableBody = connect()(TableBody);
export default withDragDropContext(TableBody);
