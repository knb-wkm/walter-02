import { delay } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions";

function* watchDeleteFileBuffer() {
  while (true) {
    const { file } = yield take(actions.deleteFileBuffer().type);
    const api = new API();
    yield put(actions.loadingStart());

    try {
      yield call(delay, 1000);
      yield call(api.deleteFile, file);
      yield put(actions.popFileToBuffer(file));
      const payload = yield call(api.fetchFiles, file.dir_id);
      yield put(actions.initFileTotal(payload.data.status.total));
      yield put(actions.initFiles(payload.data.body));

    }
    catch (e) {

    }
    finally {
      yield put(actions.loadingEnd());
    }
  }
}

export default watchDeleteFileBuffer;
