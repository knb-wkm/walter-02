import React, { Component } from "react";
import Dialog from "material-ui/Dialog";
import IconButton from "material-ui/IconButton";
import FlatButton from "material-ui/FlatButton";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";

class EditIcon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    this.styles = {
      smallIcon: {
        width: 24,
        height: 24
      },
      small: {
        width: 42,
        height: 42,
        padding: 4
      }
    };
  }

  render() {
    const actions = 
        <FlatButton
          label="close"
          primary={true}
          onTouchTap={() => this.setState({ open: false })}
        />
      ;

    const { file } = this.props;

    return (
      <div>
        <IconButton onClick={() => this.setState({open: true})}>
          <EditorModeEdit />
        </IconButton>
        <Dialog
          title="ファイル編集"
          modal={false}
          actions={actions}
          open={this.state.open}
          onRequestClose={() => this.setState({open: false}) }
        >
          ファイル名: {file.name}
        </Dialog>

      </div>
    );
  }
}

export default EditIcon;
