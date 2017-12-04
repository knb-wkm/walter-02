import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

// actions
import * as actions from "../actions/files";
import * as commons from "../actions/commons";
import * as actionTypes from "../actionTypes";

function* watchAddMetaInfoToFile() {
  while (true) {
    const { file, metaInfo, value } = yield take(actionTypes.ADD_META_INFO_TO_FILE);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(api.addMetaInfoToFile, file, metaInfo, value);
      const payload = yield call(api.fetchFile, file._id);
      yield put(actions.initFile(payload.data.body));
      yield put(commons.triggerSnackbar("メタ情報を追加しました"));
    }
    catch (e) {
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchAddMetaInfoToFile;
