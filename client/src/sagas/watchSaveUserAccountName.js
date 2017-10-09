import { delay } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions";
import * as actionTypes from "../actionTypes";

function* watchSaveUserAccountName() {
  while (true) {
    const { user } = yield take(actionTypes.SAVE_USER_ACCOUNT_NAME);
    const api = new API();
    yield put(actions.clearUserValidationError());

    try {
      yield put(actions.loadingStart());
      yield call(delay, 1000);
      yield call(api.saveUserAccountName, user);
      const payload = yield call(api.fetchUser, user._id);
      yield put(actions.initUser(payload.data.body));
      yield put(actions.loadingEnd());
      yield put(actions.triggerSnackbar("アカウント名を変更しました"));
      yield call(delay, 3000);
      yield put(actions.closeSnackbar());
    }
    catch (e) {
      const { errors } = e.response.data.status;
      yield put(actions.changeUserValidationError(errors));
      yield put(actions.loadingEnd());
    }
  }
}

export default watchSaveUserAccountName;