import React from "react";
import PropTypes from "prop-types";

// material ui
import FlatButton from "material-ui/FlatButton";
import Dialog from "material-ui/Dialog";

// components
import Authority from "../Authority";

const AuthorityFileDialog = ({
  open,
  handleClose,
  file,
  users,
  roles,
  addAuthority,
  deleteAuthority,
  triggerSnackbar
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
      title="権限を変更"
      modal={false}
      actions={actions}
      open={open}
      onRequestClose={handleClose} >

      <Authority
        file={file}
        users={users}
        roles={roles}
        addAuthority={addAuthority}
        deleteAuthority={deleteAuthority}
        triggerSnackbar={triggerSnackbar} />

    </Dialog>
  );
};

AuthorityFileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  file: PropTypes.object,
  users: PropTypes.array.isRequired,
  roles: PropTypes.array.isRequired,
  addAuthority: PropTypes.func.isRequired,
  deleteAuthority: PropTypes.func.isRequired,
  triggerSnackbar: PropTypes.func.isRequired
};

export default AuthorityFileDialog;