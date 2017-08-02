import React, { Component } from "react";

// material-ui
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardText, 
  CardMedia, 
  CardActions
} from 'material-ui/Card';
import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

// material icon
import HardwareKeyboardArrowLeft from "material-ui/svg-icons/hardware/keyboard-arrow-left";

// components
import Authority from "../Authority";
import History from "../History";
import Tag from "../Tag";
import MetaInfo from "../MetaInfo";

const styles = {
  fileImageWrapper: {
    display: "flex"
  },
  innerCard: {
    marginTop: 10,
    marginLeft: 15,
    marginRight: 15
  },
  metaRow: {
    marginTop: 10,
    display: "flex"
  },
  metaCell: {
    marginRight: 20,
    width: "20%"
  }
};

class FileDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editBasic: {
        open: false,
        fileName: ""
      },
      editAuthority: {
        open: false
      },
      editTag: {
        value: ""
      },
      editMetaInfo: {
        open: false
      }
    };
  }

  renderBasic = (file) => {
    const changeFileName = () => {
      const fileName = this.refs.fileName.getValue();

      if ( fileName === "" ) {
        this.setState({ editBasic: { open: false } });
        return;
      }

      this.props.editFile({ ...this.props.file, name: fileName });
      this.setState({ editBasic: { open: false } });
      this.props.triggerSnackbar("ファイル名を変更しました");
    };

    const fileName = this.state.editBasic.open
          ? (
            <TextField
              ref="fileName"
              defaultValue={file.name}
              onKeyDown={ e => e.key === "Enter" ? changeFileName() : null }
              />
          )
          : <div>{file.name}</div>;

    return (
      <div>
        <div style={styles.metaRow}>
          <div style={styles.metaCell}>ファイル名</div>
          {fileName}
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCell}>サイズ</div>
          <div>10.0KB</div>
        </div>
        <div style={styles.metaRow}>
          <div style={styles.metaCell}>最終更新</div>
          <div>{file.modified}</div>
        </div>
      </div>
    );
  };

  renderAuthorities = (file) => {
    const renderAuthority = (auth, idx) => {
      return (
        <div key={idx} style={styles.metaRow}>
          <div style={{...styles.metaCell, width: "30%"}}>
            {auth.user.name_jp}
          </div>
          <div>{auth.role.name}</div>
        </div>
      );
    };

    return file.authorities.map( (auth, idx) => renderAuthority(auth, idx));

  };

  renderHistories = (file) => {
    return file.histories.map( (history, idx) => {
      return <History key={idx} history={history} />;
    });
  };

  renderAuthorityDialog = () => {
    const editAuthorityActions = (
      <FlatButton
        label="閉じる"
        primary={true}
        onTouchTap={() => this.setState({ editAuthority: { open: false } })}
        />
    );
    
    return (
      <Dialog
        title="権限を変更"
        modal={false}
        actions={editAuthorityActions}
        open={this.state.editAuthority.open}
        onRequestClose={() => this.setState({ editAuthority: { open: false } })} >

        <Authority
          file={this.props.file}
          users={this.props.users}
          roles={this.props.roles}
          addAuthority={this.props.addAuthority}
          deleteAuthority={this.props.deleteAuthority}
          triggerSnackbar={this.props.triggerSnackbar} />

      </Dialog>
    );
    
  };

  renderMetaInfos = (file) => {
    const render = (meta, idx) => {
      return (
        <div key={idx} style={styles.metaRow}>
          <div style={styles.metaCell}>{meta.key}</div>
          <div style={styles.metaCell}>{meta.value}</div>
        </div>
      );
    };

    return file.metaInfo.map( (meta, idx) => render(meta, idx) );
  };

  renderMetaInfoDialog = () => {
    const actions = (
      <FlatButton
        label="閉じる"
        primary={true}
        onTouchTap={() => this.setState({ editMetaInfo: { open: false } })}
        />
    );

    return (
      <Dialog
        title="メタ情報を編集"
        actions={actions}
        modal={false}
        open={this.state.editMetaInfo.open}
        onRequestClose={() => this.setState({ editMetaInfo: { open: false } })} >

        <MetaInfo
          file={this.props.file}
          addMetaInfo={this.props.addMetaInfo}
          deleteMetaInfo={this.props.deleteMetaInfo}
          triggerSnackbar={this.props.triggerSnackbar} />

      </Dialog>
    );
  };

  render() {
    const cardOverlay = (
      <CardTitle subtitle={this.props.file.name} />
    );

    const fileTitle = (
      <div
        style={{display: "flex", alignItems: "center"}}>
        <IconButton
          onTouchTap={() => {
            this.props.history.goBack();
          }}>
          <HardwareKeyboardArrowLeft />
        </IconButton>
        {this.props.file.name}
      </div>
    );

    return (
      <Card style={{paddingBottom: 10}}>
        <CardHeader
          title={fileTitle} />

        <div style={styles.fileImageWrapper}>

          <div style={{width: "70%"}}>

            <Card style={styles.innerCard}>
              <CardMedia overlay={cardOverlay}>
                <img src="/images/baibaikihon.png" />
              </CardMedia>
            </Card>

          </div>

          <div style={{width: "30%"}}>

            <Card style={styles.innerCard}>
              <CardHeader title="基本情報" />
              <CardText>
                {this.renderBasic(this.props.file)}
              </CardText>
              <CardActions>
                <RaisedButton
                  onTouchTap={() => this.setState({ editBasic: { open: true } })}
                  label="編集" />
              </CardActions>
            </Card>

            <Card style={styles.innerCard}>
              <CardHeader title="メンバー" />
              <CardText>
                {this.renderAuthorities(this.props.file)}
              </CardText>
              <CardActions>
                <RaisedButton
                  onTouchTap={() => this.setState({ editAuthority: { open: true } })}
                  label="編集"
                  />
              </CardActions>
            </Card>

            <Card style={styles.innerCard}>
              <CardHeader title="タグ" />
              <CardText>

                <Tag 
                  file={this.props.file}
                  addTag={this.props.addTag}
                  deleteTag={this.props.deleteTag}
                  triggerSnackbar={this.props.triggerSnackbar} />

              </CardText>
            </Card>

            <Card style={styles.innerCard}>
              <CardHeader title="メタ情報" />
              <CardText>
                {this.renderMetaInfos(this.props.file)}
              </CardText>
              <CardActions>
                <RaisedButton
                  label="編集"
                  onTouchTap={() => this.setState({ editMetaInfo: { open: true } })} />
              </CardActions>
            </Card>

            <Card style={styles.innerCard}>
              <CardHeader title="履歴情報" />
              <CardText>
                {this.renderHistories(this.props.file)}
              </CardText>
            </Card>

          </div>

        </div>

        {this.renderAuthorityDialog()}
        {this.renderMetaInfoDialog()}

      </Card>
    );
  }
}

export default FileDetail;
