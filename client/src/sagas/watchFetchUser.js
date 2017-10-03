import { delay } from "redux-saga";
import { all, call, put, take } from "redux-saga/effects";

import { API } from "../apis";

import {
  requestFetchUser,
  initUser,
  initGroups,
  loadingStart,
  loadingEnd
} from "../actions";

function* watchFetchUser() {
  while (true) {
    const task = yield take(requestFetchUser().type);
    const api = new API();
    yield put(loadingStart());

    try {
      yield call(delay, 1000);
      const [user, group] = yield all([
        call(api.fetchUser, task.user_id),
        call(api.fetchGroup, task.tenant_id)
      ]);

      yield put(initUser(user.data.body));
      console.log("init user done");
      yield put(initGroups(group.data.body));
      console.log("init group done");
    }
    catch (e) {
      console.log(e);
    }
    finally {
      console.log("watch user end");
      yield put(loadingEnd());
    }

  }
}

export default watchFetchUser;
