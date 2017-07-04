import React, { Component } from "react";
import Snackbar from "material-ui/Snackbar";
import FileCloudUpload from "material-ui/svg-icons/file/cloud-upload";
import FileCreateNewFolder from "material-ui/svg-icons/file/create-new-folder";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import AddFileDialog from "./AddFileDialog";
import moment from "moment";

class FileAction extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      files: [],
      snack: {
        open: false,
        message: " ",
        hide_duration: 3000
      }
    };

  }

  render() {
    const { addFiles } = this.props;

    const upload_button = <FileCloudUpload />;
    const create_folder_button = <FileCreateNewFolder />;

    const handleOpen = () => {
      this.setState({ open: true });
    };

    const handleClose = () => {
      this.setState({open: false, files: []});
    };

    const handleUpload = () => {
      this.setState({open: false});
      addFiles(this.state.files);
      this.setState({
        snack: {
          open: true, message: "ファイルをアップロードしました"
        }
      });
      this.setState({ files: [] });
    };

    const onDrop = (files) => {
      let _files = this.state.files.slice();

      files.forEach(f => {
        const push_file = {
          name: f.name,
          modified: moment().format("YYYY-MM-DD HH:mm"),
          owner: "user01",
          dir_id: Number(this.props.dir_id),
          is_dir: false,
          is_display: true
        };

        _files.push(push_file);
      });
      this.setState({ files: _files });
    };

    return (
      <div className="file-action">
  
        <Menu>
          <MenuItem
            primaryText="ファイルをアップロード" 
            leftIcon={upload_button}
            onTouchTap={handleOpen}
          />
          <MenuItem
            primaryText="新しいフォルダ"
            leftIcon={create_folder_button}
            onTouchTap={() => console.log("@todo") }
          />
        </Menu>

        <AddFileDialog
          files={this.state.files}
          open={this.state.open}
          handleClose={handleClose}
          handleUpload={handleUpload}
          onDrop={onDrop}
        />
        <Snackbar
          open={this.state.snack.open}
          message={this.state.snack.message}
          autoHideDuration={3000}
          onRequestClose={() => this.setState({
            snack: {
              open: false
            }
          })}
        />
      </div>
    );
  }
};

export default FileAction;
