import { combineReducers } from "redux";

// reducers
import files from "./filesReducer";
import file from "./fileReducer";
import dirs from "./dirsReducer";
import snackbar from "./snackbarReducer";
import addDir from "./addDirReducer";
import addFile from "./addFileReducer";
import notifications from "./notificationsReducer";
import filesBuffer from "./filesBufferReducer";
import fileSortTarget from "./fileSortTargetReducer";
import users from "./usersReducer";
import roles from "./rolesReducer";
import selectedDir from "./selectedDirReducer";
import session from "./sessionReducer";
import loading from "./loadingReducer";
import tenant from "./tenantReducer";
import tags from "./tagsReducer";
import changePassword from "./changePasswordReducer";
import createDir from "./createDirReducer";
import fileUpload from "./fileUploadReducer";
import deleteFile from "./deleteFileReducer";
import deleteFiles from "./deleteFilesReducer";
import dirTree from "./dirTreeReducer";
import metaInfo from "./metaInfoReducer";
import user from "./userReducer";
import groups from "./groupsReducer";
import group from "./groupReducer";
import role from "./roleReducer";
import actions from "./actionsReducer";
import fileDetailSearch from "./fileDetailSearchReducer";
import tag from "./tagReducer";
import moveFilesState from "./moveFilesReducer";
import analysis from "./analysisReducer";
import filePagination from "./filePaginationReducer";
import authorityFile from "./authorityFileReducer";
import copyDir from "./copyDirReducer";
import deleteDir from "./deleteDirReducer";
import authorityDir from "./authorityDirReducer";
import moveFile from "./moveFileReducer";
import copyFile from "./copyFileReducer";
import fileHistory from "./fileHistoryReducer";
import fileTag from "./fileTagReducer";
import fileMetaInfo from "./fileMetaInfoReducer";
import restoreFiles from "./restoreFilesReducer";

const fileApp = combineReducers({
  files,
  file,
  dirs,
  snackbar,
  addDir,
  addFile,
  filesBuffer,
  fileSortTarget,
  notifications,
  users,
  roles,
  selectedDir,
  session,
  loading,
  tenant,
  tags,
  changePassword,
  createDir,
  fileUpload,
  deleteFile,
  deleteFiles,
  dirTree,
  metaInfo,
  user,
  groups,
  group,
  role,
  actions,
  fileDetailSearch,
  tag,
  moveFilesState,
  analysis,
  filePagination,
  authorityFile,
  copyDir,
  deleteDir,
  authorityDir,
  moveFile,
  copyFile,
  fileHistory,
  fileTag,
  fileMetaInfo,
  restoreFiles
});

export default fileApp;
