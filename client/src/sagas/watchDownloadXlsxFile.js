import { call, put, take, select, cancel } from "redux-saga/effects";

import { API } from "../apis";

import { isDisplayUnvisibleSetting } from "./watchToggleDisplayUnvisibleFiles";

import * as actions from "../actions/files";
import * as commons from "../actions/commons";

import { saveAs } from "file-saver";
import { DOWNLOAD_XLSX_LIMIT_COUNT } from "../constants";

function* watchDownloadXlsxFile() {
  while (true) {
    const { dir_id } = yield take(actions.downloadXlsxFile().type);

    const {total} = yield select( state => state.filePagination );
    if (total >= DOWNLOAD_XLSX_LIMIT_COUNT) {
      yield put(commons.openException(`ファイルの件数が${total}を超過しているため一覧のダウンロードに失敗しました`));
      yield cancel();
    }

    const api = new API();

    // 非表示ファイルを取得するか
    const isDisplayUnvisible = yield call(isDisplayUnvisibleSetting);

    try {
      const { page } = yield select( state => state.filePagination );
      const { sorted, desc } = yield select( state => state.fileSortTarget );

      yield put(commons.loadingStart());
      const payload = yield call(api.downloadXlsxFile, dir_id, page, sorted, desc, isDisplayUnvisible);

      const download = new Blob(
        [ payload.data ]
      );

      yield saveAs(download, "list.xlsx");
    }
    catch (e) {
      yield put(commons.openException("ファイルのダウンロードに失敗しました" ));
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDownloadXlsxFile;
