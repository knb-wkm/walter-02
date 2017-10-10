import React, { Component } from "react";

// store
import { connect } from "react-redux";

// material ui
import { Card } from "material-ui/Card";

// components
import NavigationContainer from "./NavigationContainer";
import FileSearchContainer from "./FileSearchContainer";
import FileActionContainer from "./FileActionContainer";
import FileListHeader from "../components/FileListHeader";
import Dir from "../components/Dir";
import File from "../components/File";

// actions
import * as actions from "../actions";

const styles = {
  title: {
    marginTop: 40,
    marginLeft: 30,
    padding: 5,
    fontSize: 18
  },
  search_summary: {
    marginTop: 20,
    marginLeft: 30,
    padding: 5,
    fontSize: 14,
    color: "rgb(85, 85, 85)"
  },
  table_header_wrap: {
    display: "flex",
    width: "95%",
    marginLeft: 30,
    borderBottom: "1px solid lightgray",
    backgroundColor: "inherit"
  },
  table_header: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    textAlign: "left",
    fontFamily: "Roboto sans-serif",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: "inherit",
    color: "rgb(158, 158, 158)",
    fontSize: 12,
    height: 48
  },
  table_row: {
    display: "flex",
    width: "95%",
    marginLeft: 30,
    borderBottom: "1px solid lightgray",
    backgroundColor: "inherit"
  },
  table_cell: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 24,
    paddingRight: 24,
    textAlign: "left",
    fontFamily: "Roboto sans-serif",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: "inherit",
    height: 70,
    color: "rgb(80, 80, 80)",
    fontSize: 13
  }
};

const headers = [
  {key: "checkbox", width: "5%", label: ""},
  {key: "name", width: "50%", label: "名前"},
  {key: "modified", width: "20%", label: "最終更新"},
  {key: "dir", width: "15%", label: "場所"},
  {key: false, width: "5%", label: "Action"}
];

class FileSearchResultContainer extends Component {
  componentWillMount() {
    const params = new URLSearchParams(this.props.location.search);
    const q = params.get("q");
    this.props.fetchSearchFileSimple(q);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.location.search !== nextProps.location.search) {
      const params = new URLSearchParams(nextProps.location.search);
      const q = params.get("q");
      this.props.fetchSearchFileSimple(q);
    }
  }

  renderHeaders = () => {
    return headers.map( (header, idx) => (
      <FileListHeader key={idx} header={header} style={styles.table_header} />
    ));
  };

  renderFileIsEmpty = () => {
    return (
      <div style={styles.table_row}>
        <div style={styles.table_cell}></div>
        <div style={styles.table_cell}></div>
        <div style={styles.table_cell}>
          一致したファイル、フォルダが存在しませんでした
        </div>
      </div>
    );
  };

  renderFile = (file, idx) => {
    const dirComponent = (
      <Dir
        dir={file} 
        rowStyle={styles.table_row}
        cellStyle={styles.table_cell}
        headers={headers}
        handleCopyDir={true}
        handleDeleteDir={true}
        handleAuthorityDir={true}
        handleHistoryDir={true}
        editDir={true} />
    );

    const fileComponent = (
      <File
        file={file}
        rowStyle={styles.table_row}
        cellStyle={styles.table_cell}
        headers={headers}
        handleMoveFile={true}
        handleHistoryFile={true}
        handleTagFile={true} />
    );
    return file.is_dir ? dirComponent : fileComponent;
  };

  render() {
    return (
      <div>
        <NavigationContainer />

        <Card>

          <div style={{ display: "flex" }}>
            <div style={{ width: "40%" }}>
              <div style={styles.title}>検索結果</div>
              <div style={styles.search_summary}>
                ファイル、フォルダの検索結果 {this.props.files.length} 件
              </div>
            </div>

            <div style={{ width: "60%" }}>
              <FileSearchContainer />
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div style={{ width: "78%" }}>
              <div style={styles.table_header_wrap}>
                {this.renderHeaders()}
              </div>
              <div style={{ paddingBottom: 30 }}>
                {this.props.files.length === 0
                  ? this.renderFileIsEmpty()
                  : this.props.files.map( ( file, idx) => this.renderFile(file, idx) )
                }
              </div>
            </div>

            <div style={{ width: "22%" }}>
              <FileActionContainer isSearch={true} />
            </div>
          </div>

        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    files: state.files,
    tenant: state.tenant
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  searchFileSimple: (value) => {
    dispatch(actions.searchFileSimple(value, ownProps.history));
  },
  fetchSearchFileSimple: (value) => {
    dispatch(actions.fetchSearchFileSimple(value));
  }
});

FileSearchResultContainer = connect(
  mapStateToProps, mapDispatchToProps
)(FileSearchResultContainer);

export default FileSearchResultContainer;
