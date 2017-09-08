import React, { Component } from "react";

// store
import { connect } from "react-redux";

// components
import DirTree from "../components/DirTree";

// material
import FileFolderOpen from "material-ui/svg-icons/file/folder-open";
import HardwareKeyboardArrowDown from "material-ui/svg-icons/hardware/keyboard-arrow-down";
// actions
import { requestFetchDirTree, selectDirTree } from "../actions";

const styles = {
  dirWrapper: {
    padding: 15,
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: "rgb(255, 255, 255)",
    border: "solid 1px",
    borderColor: "rgb(200, 200, 200)"
  }
};

class DirTreeContainer extends Component {
  componentWillMount() {
    this.props.requestFetchDirTree(this.props.tenant.dirId);    
  }

  renderDirTree = (node, idx) => {
    return (
      <DirTree key={idx} node={node}
               selectDirTree={this.props.selectDirTree}
               dirTree={this.props.dirTree} />
    );
  };

  render() {
   
    if (this.props.dirTree.loading) {
      return <div></div>;
    } else {
      const node = this.props.dirTree.node;

      return (
        <div style={styles.dirWrapper}>

          <div style={{ display: "flex" }}>

            <div>
              <HardwareKeyboardArrowDown />
            </div>

            <div style={{ display: "flex", marginLeft: 7 }}
                 onClick={() => this.props.selectDirTree(this.props.dirTree.node)}>
              <div>
                <FileFolderOpen />
              </div>

              <div style={{ marginLeft: 10 }}>
                <p style={{ margin: 0, padding: 0 }}>
                  {node.name}
                </p>
              </div>
            </div>
          </div>

          {node.children.map( (node, idx) => this.renderDirTree(node, idx) )}

        </div>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tenant: state.tenant,
    dirTree: state.dirTree,
    selectedDir: state.selectedDir
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  selectDirTree: (dir) => { dispatch(selectDirTree(dir)); },
  requestFetchDirTree: (root_id) => { dispatch(requestFetchDirTree(root_id)); }
});

DirTreeContainer = connect(mapStateToProps, mapDispatchToProps)(DirTreeContainer);

export default DirTreeContainer;
