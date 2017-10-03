import { delay } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions";

function* watchSaveUserEmail() {
  while (true) {
    const task = yield take(actions.saveUserEmail().type);
    const api = new API();
    yield put(actions.clearUserValidationError());

    try {
      yield put(actions.loadingStart());
      yield call(delay, 1000);
      yield call(api.saveUserEmail, task.user);
      const payload = yield call(api.fetchUser, task.user._id);
      yield put(actions.initUser(payload.data.body));
      yield put(actions.loadingEnd());
      yield put(actions.triggerSnackbar("メールアドレスを変更しました"));
    }
    catch (e) {
      const { errors } = e.response.data.status;
      yield put(actions.changeUserValidationError(errors));
      yield put(actions.loadingEnd());
    }
  }
}

export default watchSaveUserEmail;
