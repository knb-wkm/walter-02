import { delay } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

function* watchCreateDir() {
  while (true) {
    const { dir_id, dir_name } = yield take("CREATE_DIR");
    yield put({ type: "LOADING_START" });

    try {
      yield call(delay, 1000);
      yield call(API.createDir, dir_id, dir_name);
      const payload = yield call(API.fetchFiles, dir_id);
      yield put({ type: "INIT_FILES", files: payload.data.body });
      yield put({ type: "TOGGLE_CREATE_DIR" });
      yield put({ type: "TRIGGER_SNACK", message: "フォルダを作成しました" });
    }
    catch (e) {
      const { errors } = e.response.data.status;
      yield put({ type: "CREATE_DIR_ERROR", errors });
    }
    finally {
      yield put({ type: "LOADING_END" });
    }
      
  }
}

export default watchCreateDir;
