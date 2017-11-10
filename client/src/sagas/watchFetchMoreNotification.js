import { call, put, take, select } from "redux-saga/effects";

import { API } from "../apis";

import * as actions from "../actions/index";
import * as commons from "../actions/commons";

function* watchFetchMoreNotification(){
  while(true) {
    yield take(actions.requestFetchMoreNotification().type);
    const state = yield select();
    const nextPage = parseInt( state.notifications.page ) + 1;
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const payload = yield call(api.fetchNotification, nextPage);
      yield put(actions.initMoreNotificaiton(payload.data.body, payload.data.status));
      yield call(api.updateNotificationsRead, payload.data.body);
    } catch (e) {

    }
    finally{
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchMoreNotification;