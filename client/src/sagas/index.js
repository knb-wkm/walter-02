import { fork } from "redux-saga/effects";

import watchLogin from "./watchLogin";
import watchLogout from "./watchLogout";
import watchFetchFiles from "./watchFetchFiles";
import watchFetchFile from "./watchFetchFile";
import watchFetchTags from "./watchFetchTags";
import watchAddTag from "./watchAddTag";
import watchDelTag from "./watchDelTag";
import watchChangePassword from "./watchChangePassword";
import watchCreateDir from "./watchCreateDir";
import watchDeleteFile from "./watchDeleteFile";
import watchUploadFiles from "./watchUploadFiles";
import watchMoveFile from "./watchMoveFile";
import watchSearchFileSimple from "./watchSearchFileSimple";
import watchFetchSearchFileSimple from "./watchFetchSearchFileSimple";
import watchFetchDirTree from "./watchFetchDirTree";
import watchMoveDir from "./watchMoveDir";
import watchFetchMetaInfos from "./watchFetchMetaInfos";
import watchAddMetaInfoToFile from "./watchAddMetaInfoToFile";
import watchDeleteMetaInfoToFile from "./watchDeleteMetaInfoToFile";
import watchFetchUsers from "./watchFetchUsers";
import watchFetchUser from "./watchFetchUser";
import watchDeleteGroupOfUser from "./watchDeleteGroupOfUser";
import watchAddGroupOfUser from "./watchAddGroupOfUser";
import watchToggleUser from "./watchToggleUser";
import watchSaveUserName from "./watchSaveUserName";
import watchSaveUserEmail from "./watchSaveUserEmail";
import watchSearchUsersSimple from "./watchSearchUsersSimple";
import watchFetchGroups from "./watchFetchGroups";
import watchFetchGroup from "./watchFetchGroup";
import watchSaveGroupName from "./watchSaveGroupName";
import watchSaveGroupDescription from "./watchSaveGroupDescription";
import watchCreateUser from "./watchCreateUser";
import watchCreateGroup from "./watchCreateGroup";
import watchSaveUserPasswordForce from "./watchSaveUserPasswordForce";
import watchDeleteGroup from "./watchDeleteGroup";
import watchFetchRoles from "./watchFetchRoles";
import watchFetchRole from "./watchFetchRole";
import watchSaveRoleName from "./watchSaveRoleName";
import watchSaveRoleDescription from "./watchSaveRoleDescription";
import watchDeleteRoleOfAction from "./watchDeleteRoleOfAction";
import watchCreateRole from "./watchCreateRole";
import watchFetchActions from "./watchFetchActions";
import watchAddRoleOfAction from "./watchAddRoleOfAction";
import watchDeleteRole from "./watchDeleteRole";
import watchFetchFileSearchItems from "./watchFetchFileSearchItems";
import watchSearchFileDetail from "./watchSearchFileDetail";
import watchFetchTag from "./watchFetchTag";
import watchSaveTagLabel from "./watchSaveTagLabel";
import watchSaveTagColor from "./watchSaveTagColor";
import watchCreateTag from "./watchCreateTag";
import watchDeleteTag from "./watchDeleteTag";
import watchDeleteFiles from "./watchDeleteFiles";
import watchMoveFiles from "./watchMoveFiles";
import watchFetchAnalysis from "./watchFetchAnalysis";
import watchToggleStar from "./watchToggleStar";
import watchDeleteFileBuffer from "./watchDeleteFileBuffer";
import watchDownloadFile from "./watchDownloadFile";
import watchDownloadFiles from "./watchDownloadFiles";
import watchAddAuthorityToFile from "./watchAddAuthorityToFile";
import watchDeleteAuthorityToFile from "./watchDeleteAuthorityToFile";
import { watchRequestVerifyToken } from "./watchRequestVerifyToken";
import watchSearchTagSimple from "./watchSearchTagSimple";
import watchSearchGroupSimple from "./watchSearchGroupSimple";
import watchFetchMetaInfo from "./watchFetchMetaInfo";
import watchCreateMetaInfo from "./watchCreateMetaInfo";
import watchSaveUserAccountName from "./watchSaveUserAccountName";
import watchCopyFile from "./watchCopyFile";
import watchFetchSearchFileDetail from "./watchFetchSearchFileDetail";
import watchSortFile from "./watchSortFile";
import watchRestoreFile from "./watchRestoreFile";
import watchTriggerSnackbar from "./watchTriggerSnackbar";
import watchFetchFilePreview from "./watchFetchFilePreview";
import watchOpenException from "./watchOpenException";
import watchFetchRoleMenus from "./watchFetchRoleMenus";
import watchFetchRoleMenu from "./watchFetchRoleMenu";
import watchSaveRoleMenuName from "./watchSaveRoleMenuName";
import watchSaveRoleMenuDescription from "./watchSaveRoleMenuDescription";
import watchFetchMenus from "./watchFetchMenus";
import watchAddRoleOfMenu from "./watchAddRoleOfMenu";
import watchDeleteRoleOfMenu from "./watchDeleteRoleOfMenu";
import watchCreateRoleMenu from "./watchCreateRoleMenu";
import watchDeleteRoleMenu from "./watchDeleteRoleMenu";
import watchFetchAuthorityMenus from "./watchFetchAuthorityMenus";
import watchRequestFetchDisplayItems from "./watchRequestFetchDisplayItems";
import watchSaveUserRoleId from "./watchSaveUserRoleId";
import watchFetchNotification from "./watchFetchNotification";
import watchUpdateNotificationsRead from "./watchUpdateNotificationsRead";
import watchFetchMoreNotification from "./watchFetchMoreNotification";
import watchChangeFileName from "./watchChangeFileName";
import watchFetchAnalysisPeriod from "./watchFetchAnalysisPeriod";
import watchDeleteDirs from "./watchDeleteDirs";
import watchDownloadXlsxFile from "./watchDownloadXlsxFile";
import watchDownloadXlsxFileSimple from "./watchDownloadXlsxFileSimple";
import watchDownloadXlsxFileDetail from "./watchDownloadXlsxFileDetail";
import watchSaveMetaInfoName from "./watchSaveMetaInfoName";
import watchSaveMetaInfoLabel from "./watchSaveMetaInfoLabel";
import watchRequestFetchDir from "./watchRequestFetchDIr";

function* Saga() {
  yield fork(watchLogin);
  yield fork(watchLogout);
  yield fork(watchFetchFiles);
  yield fork(watchFetchFile);
  yield fork(watchFetchTags);
  yield fork(watchAddTag);
  yield fork(watchDelTag);
  yield fork(watchChangePassword);
  yield fork(watchCreateDir);
  yield fork(watchDeleteFile);
  yield fork(watchUploadFiles);
  yield fork(watchMoveFile);
  yield fork(watchSearchFileSimple);
  yield fork(watchFetchSearchFileSimple);
  yield fork(watchFetchDirTree);
  yield fork(watchMoveDir);
  yield fork(watchFetchMetaInfos);
  yield fork(watchAddMetaInfoToFile);
  yield fork(watchDeleteMetaInfoToFile);
  yield fork(watchFetchUsers);
  yield fork(watchFetchUser);
  yield fork(watchDeleteGroupOfUser);
  yield fork(watchAddGroupOfUser);
  yield fork(watchToggleUser);
  yield fork(watchSaveUserName);
  yield fork(watchSaveUserEmail);
  yield fork(watchSearchUsersSimple);
  yield fork(watchFetchGroups);
  yield fork(watchFetchGroup);
  yield fork(watchSaveGroupName);
  yield fork(watchSaveGroupDescription);
  yield fork(watchCreateUser);
  yield fork(watchCreateGroup);
  yield fork(watchSaveUserPasswordForce);
  yield fork(watchDeleteGroup);
  yield fork(watchFetchRoles);
  yield fork(watchFetchRole);
  yield fork(watchSaveRoleName);
  yield fork(watchSaveRoleDescription);
  yield fork(watchDeleteRoleOfAction);
  yield fork(watchCreateRole);
  yield fork(watchFetchActions);
  yield fork(watchAddRoleOfAction);
  yield fork(watchDeleteRole);
  yield fork(watchFetchFileSearchItems);
  yield fork(watchSearchFileDetail);
  yield fork(watchFetchTag);
  yield fork(watchSaveTagLabel);
  yield fork(watchSaveTagColor);
  yield fork(watchCreateTag);
  yield fork(watchDeleteTag);
  yield fork(watchDeleteFiles);
  yield fork(watchMoveFiles);
  yield fork(watchFetchAnalysis);
  yield fork(watchToggleStar);
  yield fork(watchDeleteFileBuffer);
  yield fork(watchDownloadFile);
  yield fork(watchDownloadFiles);
  yield fork(watchAddAuthorityToFile);
  yield fork(watchDeleteAuthorityToFile);
  yield fork(watchRequestVerifyToken);
  yield fork(watchSearchTagSimple);
  yield fork(watchSearchGroupSimple);
  yield fork(watchFetchMetaInfo);
  yield fork(watchCreateMetaInfo);
  yield fork(watchSaveUserAccountName);
  yield fork(watchCopyFile);
  yield fork(watchFetchSearchFileDetail);
  yield fork(watchSortFile);
  yield fork(watchRestoreFile);
  yield fork(watchTriggerSnackbar);
  yield fork(watchFetchFilePreview);
  yield fork(watchOpenException);
  yield fork(watchFetchRoleMenus);
  yield fork(watchFetchRoleMenu);
  yield fork(watchSaveRoleMenuName);
  yield fork(watchSaveRoleMenuDescription);
  yield fork(watchFetchMenus);
  yield fork(watchAddRoleOfMenu);
  yield fork(watchDeleteRoleOfMenu);
  yield fork(watchCreateRoleMenu);
  yield fork(watchDeleteRoleMenu);
  yield fork(watchFetchAuthorityMenus);
  yield fork(watchRequestFetchDisplayItems);
  yield fork(watchSaveUserRoleId);
  yield fork(watchFetchNotification);
  yield fork(watchUpdateNotificationsRead);
  yield fork(watchFetchMoreNotification);
  yield fork(watchChangeFileName);
  yield fork(watchFetchAnalysisPeriod);
  yield fork(watchDeleteDirs);
  yield fork(watchDownloadXlsxFile);
  yield fork(watchDownloadXlsxFileSimple);
  yield fork(watchDownloadXlsxFileDetail);
  yield fork(watchSaveMetaInfoName);
  yield fork(watchSaveMetaInfoLabel);
  yield fork(watchRequestFetchDir);
}

export default Saga;
