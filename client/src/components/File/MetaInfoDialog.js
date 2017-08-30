import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

// components
import MetaInfo from "../MetaInfo";

const MetaInfoDialog = ({
  open,
  handleClose,
  file,
  metaInfo,
  addMetaInfo,
  deleteMetaInfo
}) => {
  const actions = (
    <FlatButton
      label="閉じる"
      primary={true}
      onTouchTap={handleClose}
      />
  );

  return (
    <Dialog
      title="メタ情報を編集"
      actions={actions}
      modal={false}
      open={open}
      autoScrollBodyContent={true}
      onRequestClose={handleClose} >

      <MetaInfo
        file={file}
        metaInfo={metaInfo}
        addMetaInfo={addMetaInfo}
        deleteMetaInfo={deleteMetaInfo} />

    </Dialog>
  );
};


export default MetaInfoDialog;