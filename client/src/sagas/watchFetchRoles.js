import { delay } from "redux-saga";
import { call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/roles";
import * as commons from "../actions/commons";

function* watchFetchRoles() {
  while (true) {
    const task = yield take(actions.requestFetchRoles().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      yield call(delay, 1000);
      const payload = yield call(api.fetchRoles);
      yield put(actions.initRoles(payload.data.body));
    }
    catch (e) {
      console.log(e);
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchRoles;
