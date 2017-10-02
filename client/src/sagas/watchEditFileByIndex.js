import { delay } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

// api
import { API } from "../apis";

const api = new API();

function* watchEditFileByIndex() {
  while (true) {
    const { file } = yield take("EDIT_FILE_BY_INDEX");

    try {
      yield put({ type: "LOADING_START" });
      yield call(delay, 1000);
      yield call(api.editFile, file);
      const payload = yield call(api.fetchFiles, file.dir_id);
      yield put({ type: "INIT_FILES", files: payload.data.body });
    }
    catch (e) {
      console.log(e);
    }
    finally {
      yield put({ type: "LOADING_END" });
    }
  }
}

export default watchEditFileByIndex;
