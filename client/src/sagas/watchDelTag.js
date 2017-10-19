import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

function* watchDelTag() {
  while (true) {
    const { file, tag } = yield take("REQUEST_DEL_TAG");
    const api = new API();
    yield put({ type: "LOADING_START" });

    try {
      const payload = yield call(api.fetchDelTag, file, tag);
      yield put({ type: "INIT_FILE", file: payload.data.body });
    }
    catch (e) {
      console.log(e);
    }
    finally {
      yield put({ type: "LOADING_END" });
    }
      
  }
}

export default watchDelTag;
