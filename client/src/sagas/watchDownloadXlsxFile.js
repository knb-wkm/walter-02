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

    const api = new API();

    // 非表示ファイルを取得するか
    const isDisplayUnvisible = yield call(isDisplayUnvisibleSetting);

    try {
      yield put(commons.loadingStart());
      if (total >= DOWNLOAD_XLSX_LIMIT_COUNT) {
        throw new Error("DOWNLOAD_XLSX_LIMIT_OVER_EXCEPTION");
      }

      const { page } = yield select( state => state.filePagination );
      const { sorted, desc } = yield select( state => state.fileSortTarget );
      const payload = yield call(api.downloadXlsxFile, dir_id, page, sorted, desc, isDisplayUnvisible);

      const download = new Blob(
        [ payload.data ]
      );

      yield saveAs(download, "list.xlsx");
    }
    catch (e) {
      if (e.message === "DOWNLOAD_XLSX_LIMIT_OVER_EXCEPTION") {
        yield put(commons.openException(`ファイルの件数が${DOWNLOAD_XLSX_LIMIT_COUNT}を超過しているため一覧のダウンロードに失敗しました`));
      } else {
        yield put(commons.openException("ファイルのダウンロードに失敗しました" ));
      }
    }
    finally {
      yield put(commons.loadingEnd());
    }
  }
}

export default watchDownloadXlsxFile;
