import { call, put, take } from "redux-saga/effects";
import moment from "moment";
import { API } from "../apis";

import * as actions from "../actions/analysises";
import * as commons from "../actions/commons";

function* watchFetchAnalysis() {
  while (true) {
    const { reported_at } = yield take(actions.requestFetchAnalysis().type);
    const api = new API();
    yield put(commons.loadingStart());

    try {
      const _reported_at = moment(reported_at).format("YYYYMMDD");
      const payload = yield call(api.fetchAnalysis, _reported_at);
      yield put(actions.initAnalysis(payload.data.body));
    }      
    catch (e) {
      const { message, errors } = e.response.data.status;
      yield put(commons.openException(message, JSON.stringify(errors)));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchFetchAnalysis;
