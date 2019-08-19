import * as memMongo from "../test/memmongo";

import * as _ from "lodash";

import * as file_controller from "../controllers/files";
import * as dir_controller from "../controllers/dirs";
import * as metainfo_controller from "../controllers/metaInfos";

import * as filesData from "../test/filesdata";
import * as testHelper from "../test/helper";
import { TestControllers } from "../test/controllers";
import AppSetting from "../models/AppSetting";
import AuthorityFile from "../models/AuthorityFile";
import FileMetaInfo from "../models/FileMetaInfo";
import File from "../models/File";
import Tag from "../models/Tag";

jest.setTimeout(40000);
const tenant_name = 'test'
let testControllers

describe('lib/controllers/files', () => {
  let default_res
  let initData
  let appSetting_InheritParentDirAuth
  const updateAppSetting_InheritParentDirAuth = async value => {
    appSetting_InheritParentDirAuth.enable = value
    await appSetting_InheritParentDirAuth.save()
  }

  beforeAll(async () => {
    initData = await memMongo.connect(tenant_name)
    testControllers = new TestControllers(initData.user,initData.tenant)
    default_res = {
      user: { ...initData.user, tenant_id: initData.tenant._id, tenant: { ...initData.tenant } }
    }
    appSetting_InheritParentDirAuth = await AppSetting.findOne({ tenant_id: initData.tenant._id, name: 'inherit_parent_dir_auth' })
  })
  afterAll(async () => {
    const org = initData.appSetting.filter(set => set.name === 'inherit_parent_dir_auth')
    if (org.length > 0) { //設定を元に戻す
      await updateAppSetting_InheritParentDirAuth(org[0].enable)
    }
    await memMongo.disconnect()
  })

  describe(`upload()`, () => {
    it(`テナント情報の取得: テストdb接続からテナント情報が正しく取得できる)`, async () => {
      expect(tenant_name).toBe(initData.tenant.name)
    })

    it(`パラメータ不正'files is empty'の確認： body.filesが空の場合はBadRequestエラー`, async () => {
      const req = {
        body: { files: [] }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.upload(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルのアップロードに失敗しました")
      expect(res_body.status.errors.files).toBeTruthy() //権限が正しい
    });

    it(`1ファイルupload成功の確認(appSettings.inherit_parent_dir_auth === true): 1ファイルの情報が返り、その権限は親フォルダの権限を継承し、さらに操作ユーザーのフルコントロールが付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        expect(result.res.status.success).toBe(true)
        expect(result.res.body.length).toBe(1) //１ファイルの結果が返る
        const myAuthorityFiles = (await AuthorityFile.find({ files: result.res.body[0]._id }))
        const dirAuthorityFiles = (await AuthorityFile.find({ files: initData.tenant.home_dir_id }))
        //console.log(testHelper.authDiff(myAuthorityFiles, dirAuthorityFiles))
        expect(testHelper.verifyAuth(dirAuthorityFiles, myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy()
      } else {
        expect(result.errors).toBe('* 想定外なエラー')
      }
      
    });

    it(`3ファイルupload成功の確認(appSettings.inherit_parent_dir_auth === true): 3ファイルの情報が返り、その権限は親フォルダの権限を継承し、さらに操作ユーザーのフルコントロールが付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }, { ...filesData.sample_file }, { ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        expect(result.res.status.success).toBe(true)
        expect(result.res.body.length).toBe(3) //3ファイルの結果が返る
        const dirAuthorityFiles = (await AuthorityFile.find({ files: initData.tenant.home_dir_id }))
        for (let i = 1; i < result.res.body.length; i++){
          const myAuthorityFiles = (await AuthorityFile.find({ files: result.res.body[i]._id }))
          expect(testHelper.verifyAuth(dirAuthorityFiles, myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy() //権限が正しい
        }
      } else {
        expect(result.errors).toBe('* 想定外なエラー')
      }
    });

    it(`1ファイルupload成功の確認(appSettings.inherit_parent_dir_auth === false): 1ファイルの情報が返り、その権限は操作ユーザーのフルコントロールのみ付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(false)
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        expect(result.res.status.success).toBe(true)
        expect(result.res.body.length).toBe(1) //１ファイルの結果が返る
        const myAuthorityFiles = (await AuthorityFile.find({ files: result.res.body[0]._id }))
        expect(testHelper.verifyAuth([], myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy()
      } else {
        expect(result.errors).toBe('* 想定外なエラー')
      }
    });

    it(`3ファイルupload成功の確認(appSettings.inherit_parent_dir_auth === false): 3ファイルの情報が返り、その権限は操作ユーザーのフルコントロールのみ付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(false)
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }, { ...filesData.sample_file }, { ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        expect(result.res.status.success).toBe(true)
        expect(result.res.body.length).toBe(3) //3ファイルの結果が返る
        for (let i = 1; i < result.res.body.length; i++) {
          const myAuthorityFiles = (await AuthorityFile.find({ files: result.res.body[i]._id }))
          expect(testHelper.verifyAuth([], myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy() //権限が正しい
        }
      } else {
        expect(result.errors).toBe('* 想定外なエラー')
      }
    });
  })

  describe(`view()`, () => {
    let file_id =null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_idが空です'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null}
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.view(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの取得に失敗しました")
    })

    it(`ファイル情報の取得成功を確認: responseのfile_idとrequestのfile_idが一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.view(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body._id.toString()).toBe(file_id.toString()) //file_idが一致する
      }
    })
  })

  describe(`rename()`, () => {
    let file_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.rename(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイル名の変更に失敗しました")
    })

    it(`パラメータ不正'name is empty'の確認: body.nameが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {name: ''}
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.rename(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイル名の変更に失敗しました")
    })

    it(`ファイル名変更成功の確認: responseのnameとrequestのnameが一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const new_name = testHelper.getUUID() 
      const req = {
        params: { file_id },
        body: { name: new_name }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.rename(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(new_name) //nameが一致する
      }
    })
  })

  describe(`addAuthority()`, () => {
    let file_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の追加に失敗しました")
    })
    it(`単一ファイルへのユーザー読取権限追加の成功を確認: 変更前と変更後のファイル権限の差分が、ユーザー読取権限と一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {
          user: { ...initData.user },
          group: null,
          role: { ...initData.roleFileReadonly },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd )
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].users.toString()).toBe(req.body.user._id.toString()) //差分権限のuser_idが一致
        expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`同一権限(ユーザー読取権限)追加は失敗する: BadRequestエラーが発生し、ファイルの権限は変更されない（変更前後のファイル権限が一致）`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {
          user: { ...initData.user },
          group: null,
          role: { ...initData.roleFileReadonly },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.addAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の追加に失敗しました")
      const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
      const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
      expect(diff.length).toBe(0) //変更前後で不一致なし
    })

    it(`単一ファイルへのグループ読取権限追加の成功を確認: 変更前と変更後のファイル権限の差分が、グループ読取権限と一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {
          user: null,
          group: { ...initData.groupMgr },
          role: { ...initData.roleFileReadonly },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].groups.toString()).toBe(req.body.group._id.toString()) //差分権限のuser_idが一致
        expect(diff[0].user).toBeFalsy() //差分権限のgroup_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`同一権限(グループ読取権限)追加は失敗する: BadRequestエラーが発生し、ファイルの権限は変更されない（変更前後のファイル権限が一致）`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {
          user: null,
          group: { ...initData.groupMgr },
          role: { ...initData.roleFileReadonly },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.addAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の追加に失敗しました")
      const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
      const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
      expect(diff.length).toBe(0) //変更前後で不一致なし
    })

    it(`子孫ファイルを持つフォルダへユーザー読取権限追加の成功を確認: 対象フォルダ以下全てのフォルダ・ファイルへユーザー読み取り権限が追加される`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id: parent_dir_id },
        body: {
          user: { ...initData.user },
          group: null,
          role: { ...initData.roleFileReadonly },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await file_controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]

          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致は一件
          expect(diff[0].users.toString()).toBe(req.body.user._id.toString()) //差分権限のuser_idが一致
          expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
        })
      }
    })
    it(`子孫ファイルを持つフォルダへグループ読取権限追加の成功を確認: 対象フォルダ以下全てのフォルダ・ファイルへグループ読み取り権限が追加される`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id: parent_dir_id },
        body: {
          user: null,
          group: { ...initData.groupMgr },
          role: { ...initData.roleFileReadonly },
         }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await file_controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]

          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致は一件
          expect(diff[0].groups.toString()).toBe(req.body.group._id.toString()) //差分権限のuser_idが一致
          expect(diff[0].user).toBeFalsy() //差分権限のgroup_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
        })
      }
    })
  })

  describe(`removeAuthority()`, () => {
    let file_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        const result2 = await testControllers.addAuthority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        if (result2.success) {
          const result3 = await testControllers.addAuthority(file_id, null, {...initData.groupMgr}, { ...initData.roleFileReadonly })
          if (result3.success) {
          } else {
            testHelper.stop_test(result3.errors)
          }
        } else {
          testHelper.stop_test(result2.errors)
        }
      } else {
        testHelper.stop_test(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の削除に失敗しました")
    })

    it(`単一ファイルのユーザー読取権限削除の成功を確認: 変更前と変更後のファイル権限の差分が、ユーザー読取権限と一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        query: {
          user_id: initData.user._id,
          group_id: null,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
        expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`存在しない権限(ユーザー読取権限)削除は失敗する: BadRequestエラーが発生し、ファイルの権限は変更されない（変更前後のファイル権限が一致）`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        query: {
          user_id: initData.user._id,
          group_id: null,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(0) //変更前後で不一致なし
      }
    })

    it(`単一ファイルのグループ読取権限削除の成功を確認: 変更前と変更後のファイル権限の差分が、グループ読取権限と一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        query: {
          user_id: null,
          group_id: initData.groupMgr._id,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].groups.toString()).toBe(initData.groupMgr._id.toString()) //差分権限のgroup_idが一致
        expect(diff[0].user).toBeFalsy() //差分権限のuser_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`存在しない権限(グループ読取権限)削除は失敗する: BadRequestエラーが発生し、ファイルの権限は変更されない（変更前後のファイル権限が一致）`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        query: {
          user_id: null,
          group_id: initData.groupMgr._id,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(0) //変更前後で不一致なし
      }
    })

    it(`子孫ファイルを持つフォルダのユーザー読取権限削除の成功を確認: 変更前と変更後の各ファイル権限の差分が、ユーザー読取権限と一致する`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        result = await testControllers.addAuthority(parent_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id: parent_dir_id },
        query: {
          user_id: initData.user._id,
          group_id: null,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await file_controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]

          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致は一件
          expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
          expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
        })
      }
    })

    it(`子孫ファイルを持つフォルダのグループ読取権限削除の成功を確認: 変更前と変更後の各ファイル権限の差分が、グループ読取権限と一致する`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        result = await testControllers.addAuthority(parent_dir_id, null, { ...initData.groupMgr }, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id: parent_dir_id },
        query: {
          user_id: null,
          group_id: initData.groupMgr._id,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await file_controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]

          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致は一件
          expect(diff[0].groups.toString()).toBe(initData.groupMgr._id.toString()) //差分権限のgroup_idが一致
          expect(diff[0].user).toBeFalsy() //差分権限のuser_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
        })
      }
    })
  })

  describe(`addTag()`, () => {
    let file_id = null
    let tag_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        tag_id = (await Tag.findOne({}))._id
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの追加に失敗しました")
    })

    it(`パラメータ不正'tag_id is empty'の確認: body._idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {_id: ''}
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの追加に失敗しました")
    })

    it(`タグの追加の成功を確認: 操作後のFiles.tags[0]._idがrequestのbody._idと一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {_id: tag_id}
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addTag(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file = (await File.findOne({ _id: file_id }))
        expect(file.tags[0]._id.toString()).toBe(req.body._id.toString())
      }
    })
  })

  describe(`removeTag()`, () => {
    let file_id = null
    let tag_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        tag_id = (await Tag.findOne({}))._id
        const req = {
          params: { file_id },
          body: {_id: tag_id}
        }
        const error_res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
        await file_controller.addTag(req, res)
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの削除に失敗しました")
    })

    it(`パラメータ不正'tag_id is empty'の確認: body._idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: {_id: ''}
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの削除に失敗しました")
    })

    it(`タグの削除の成功を確認: 操作後のFiles.tagsが１つ減る`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id, tag_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeTag(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file = (await File.findOne({ _id: file_id }))
        expect(file.tags.length).toBe(0)  // no tags
      }
    })
  })

  describe(`addMeta()`, () => {
    let file_id = null
    let meta = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        meta = await testControllers.addMetainfo(testHelper.getUUID(), testHelper.getUUID(),'String')
      } else {
        testHelper.stop_test(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null },
        body: { meta: { _id: null }, value: '' }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の追加に失敗しました")
    })

    it(`パラメータ不正'meta_id is empty'の確認: body.meta._idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: { meta: { _id: null }, value: '' }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の追加に失敗しました")
    })

    it(`パラメータ不正'metainfo value is empty'の確認: body.valueが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: { meta: { _id: meta.id }, value: '' }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の追加に失敗しました")
    })

    it(`メタ情報の追加の成功を確認: 操作後のFileMetaInfosの情報とリクエストのmetainfoのid/valueが一致する`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
        body: { meta: { _id: meta.id }, value: testHelper.getUUID()}
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.addMeta(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const metainfo = (await FileMetaInfo.findOne({ file_id: file_id }))
        expect(metainfo.meta_info_id.toString()).toBe(req.body.meta._id)
        expect(metainfo.value).toBe(req.body.value)
      }
    })
  })

  describe(`removeMeta()`, () => {
    let file_id = null
    let meta = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        meta = await testControllers.addMetainfo(testHelper.getUUID(),testHelper.getUUID(),'String')
        const req = {
          params: { file_id },
          body: { meta: { _id: meta.id }, value: 'qqqqq' }
        }
        const error_res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
        await file_controller.addMeta(req, res)
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の削除に失敗しました")
    })

    it(`パラメータ不正'meta_id is empty'の確認: params.meta_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id, meta_id:null },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の削除に失敗しました")
    })

    it(`メタ情報の削除の成功を確認: 操作後のFileMetaInfosの情報が削除される`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id, meta_id: meta.id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeMeta(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const metainfo = (await FileMetaInfo.findOne({ file_id: file_id }))
        expect(metainfo).toBeFalsy()
      }
    })
  })

  describe(`toggleStar()`, () => {
    let file_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.toggleStar(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルのお気に入りの設定に失敗しました")
    })

    it(`スター付与の成功を確認: 操作後のFiles.is_starが反転しtrueになる`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file = (await File.findOne({ _id: file_id }))
      const is_star_org = file.is_star
      await file_controller.toggleStar(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(is_star_org).toBeFalsy() 
        expect(res_body.body.is_star).toBeTruthy() // is_starが反転する
      }
    })

    it(`スター剥奪の成功を確認: 操作後のFiles.is_starが反転しfalseになる`, async () => {
      testHelper.check_preprocess_success(file_id)
      const req = {
        params: { file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file = (await File.findOne({ _id: file_id }))
      const is_star_org = file.is_star
      await file_controller.toggleStar(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(is_star_org).toBeTruthy() 
        expect(res_body.body.is_star).toBeFalsy() // is_starが反転する
      }
    })
  })

  describe(`moveTrash()`, () => {

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      const req = {
        params: { file_id: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.moveTrash(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ゴミ箱への移動に失敗しました")
    })

    it(`単一ファイル削除（ゴミ箱へ移動）の成功を確認: 操作後のFile.dir_idがtenant.trash_dir_idになる。ファイル権限は変更されない。`, async () => {
      let file_id = null
      let is_trash_org
      await (async() => {
        let result
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
        file_id = result.res.body[0]._id
        is_trash_org = result.res.body[0].is_trash 
        // ファイルへ権限追加
        result = await testControllers.addAuthority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.moveTrash(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.trash_dir_id.toString()) //所属フォルダが変更されている
        expect(is_trash_org).toBeFalsy() 
        expect(file_upd.is_trash).toBeTruthy() // 移動後はis_trash===true
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(0) //変更前後で不一致はなし
      }
    })

    it(`子孫ファイルを持つフォルダ削除（ゴミ箱へ移動）の成功を確認: 操作後のFile.dir_idがtenant.trash_dir_idになる。ファイル権限は変更されない。`, async () => {
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      await (async() => {
        let result
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'trash_parent'+ testHelper.getUUID())
        file_id = result.res.body._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], file_id)
        child_file_id = result.res.body[0]._id
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, file_id, testHelper.getUUID())
        child_dir_id = result.res.body._id
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [file_id, child_dir_id, child_file_id, grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await file_controller.moveTrash(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.trash_dir_id.toString()) //所属フォルダが変更されている
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const file = (await File.findOne({ _id: id }))
          expect(file.is_trash).toBeTruthy() // 移動後はis_trash===true
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]
          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(0) //変更前後で不一致はなし
        })
      }
    })
  })
  describe(`move()`, () => {
    let file_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
    })

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      const req = {
        params: { file_id: null },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.move(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの移動に失敗しました")
      expect(res_body.status.errors.file_id).toBeTruthy() 
    });

    it(`パラメータ不正'dir_id is empty'の確認: params.body.dir_idが空の場合はBadRequestエラー`, async () => {
      const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      const file_id = result.res.body[0]._id
      const req = {
        params: { file_id },
        body: {
          dir_id: null,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.move(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの移動に失敗しました")
      expect(res_body.status.errors.dir_id).toBeTruthy() //権限が正しい
    });

    it(`ファイルの子フォルダへ移動が成功するのを確認: ユーザー権限の追加されたフォルダへ移動し、権限が増加するのを確認する`, async () => {
      let child_dir_id 
      await (async() => {
        let result
        // TOPフォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
        file_id = result.res.body[0]._id
        // TOP直下へフォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        child_dir_id = result.res.body._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(child_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: child_dir_id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(child_dir_id.toString()) //所属フォルダが変更されている
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
        expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`ファイルの子フォルダへ移動が成功するのを確認: グループ権限の追加されたフォルダへ移動し、権限が増加するのを確認する`, async () => {
      let child_dir_id 
      await (async() => {
        let result
        // TOP直下へフォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        child_dir_id = result.res.body._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(child_dir_id, null, { ...initData.groupMgr }, { ...initData.roleFileReadonly })
        // TOPフォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.home_dir_id)
        file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: child_dir_id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(child_dir_id.toString()) //所属フォルダが変更されている
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].groups.toString()).toBe(initData.groupMgr._id.toString()) //差分権限のgroup_idが一致
        expect(diff[0].user).toBeFalsy() //差分権限のuser_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`ファイルの親フォルダへ移動が成功するのを確認: ユーザー権限が減らされたフォルダへ移動し、権限が減少するのを確認する`, async () => {
      let child_dir_id 
      await (async() => {
        let result
        // TOP直下へフォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        child_dir_id = result.res.body._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(child_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // 親フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.home_dir_id.toString()) //所属フォルダが変更されている
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
        expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`ファイルの親フォルダへ移動が成功するのを確認: グループ権限が減らされたフォルダへ移動し、権限が減少するのを確認する`, async () => {
      let child_dir_id
      await (async () => {
        let result
        // TOP直下へ親フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'parent' + testHelper.getUUID())
        child_dir_id = result.res.body._id
        // 親フォルダへ権限追加
        result = await testControllers.addAuthority(child_dir_id, null, { ...initData.groupMgr }, { ...initData.roleFileReadonly })
        // 親フォルダへファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await file_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.home_dir_id.toString()) //所属フォルダが変更されている
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(1) //変更前後で不一致は一件
        expect(diff[0].groups.toString()).toBe(initData.groupMgr._id.toString()) //差分権限のgroup_idが一致
        expect(diff[0].user).toBeFalsy() //差分権限のuser_idが一致
        expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
      }
    })

    it(`ゴミ箱からTOPへファイル移動が成功するのを確認: 権限はis_defaultを除いて親フォルダ権限へ洗い替えされる。`, async () => {
      let file_id 
      await (async() => {
        let result
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], file_id)
        file_id = result.res.body[0]._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        const req = {
          params: { file_id },
        }
        const error_res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
        await file_controller.moveTrash(req, res)
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [file_id]      
      await file_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.home_dir_id.toString()) //所属フォルダが変更されている
        const topAuthorityFiles = await AuthorityFile.find({ files: initData.tenant.home_dir_id })
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const file = (await File.findOne({ _id: id }))
          expect(file.is_trash).toBeFalsy() // 移動後はis_trash===false
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          return testHelper.authDiff(topAuthorityFiles, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致1件
          expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
          expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileFull._id.toString()) //差分権限のrolefile_idが一致
          expect(diff[0].is_default).toBeTruthy() 
        })
      }
    })
    it(`成功 ゴミ箱からゴミ箱へ移動: 許可しない`, async () => {
    })
  })
  
  describe(`deleteFileLogical()`, () => {

    it(`パラメータ不正'file_id is empty'の確認: params.file_idが空の場合はBadRequestエラー`, async () => {
      const req = {
        params: { file_id: null },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.deleteFileLogical(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの削除に失敗しました")
      expect(res_body.status.errors.file_id).toBeTruthy() 
    });

    it(`１ファイルの論理削除成功を確認: Files.is_deletedがtrueになる`, async () => {
      let file_id 
      let result
      // ファイルアップロード
      result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], initData.tenant.trash_dir_id)
      file_id = result.res.body[0]._id
      const req = {
        params: { file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.deleteFileLogical(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file = (await File.findOne({ _id: file_id }))
        expect(file.is_deleted).toBeTruthy() //削除フラグが立つ
        expect(file.is_trash).toBeTruthy() //
      }
    })

    it(`子孫ファイルを持つフォルダの論理削除成功を確認: 各Files.is_deletedがtrueになる`, async () => {
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      await (async() => {
        let result
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'trash_parent'+ testHelper.getUUID())
        file_id = result.res.body._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], file_id)
        child_file_id = result.res.body[0]._id
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, file_id, testHelper.getUUID())
        child_dir_id = result.res.body._id
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.deleteFileLogical(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_ids = [file_id, child_dir_id, child_file_id, grandchild_file_id]
        for (var i = 0; i < file_ids.length; i++){
          const file = (await File.findOne({ _id: file_ids[i] }))
          expect(file.is_deleted).toBeTruthy() //削除フラグが立つ
          expect(file.is_trash).toBeTruthy() //
        }
      }
    })
  })

  const _compact_response = res_body => {
    //return res_body.body.map(file => ({_id: file._id.toString(), name: file.name, dir_id: file.dir_id.toString()}))
    return res_body.body.map(file => file.name)
  }
    
  describe(`search()`, () => {
    let child_dir_id
    let child2_dir_id
    let child3_dir_id
    let grandchild_dir_id
    const folderNames = ['bcd_dir_1_' + testHelper.getUUID(),'bcd_dir_2_' + testHelper.getUUID(),'bcd_dir_3_' + testHelper.getUUID(),'bcd_dir_4_' + testHelper.getUUID(),]
    beforeAll(async () => {
      let result
      await updateAppSetting_InheritParentDirAuth(true)
      // 別ユーザーの作成
      result = await testControllers.addUserInGroup(testHelper.getUUID(), initData.roleMenuMgr._id, initData.groupMgr._id)
      const other_user = result.res.toObject()
      // フォルダ作成
      result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, folderNames[0])
      child_dir_id = result.res.body._id
      // フォルダ作成
      result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, folderNames[1])
      grandchild_dir_id = result.res.body._id
      // フォルダ作成
      result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, folderNames[2])
      child2_dir_id = result.res.body._id
      // フォルダ作成(操作権限のない)
      result = await testControllers.createDirWithSimpleauth({ ...other_user }, initData.tenant.home_dir_id, folderNames[3])
      child3_dir_id = result.res.body._id
      // ファイルアップロード(操作権限のない)
      result = await testControllers.uploadFileWithSimpleauth({ ...other_user }, [{ ...filesData.sample_file, name: 'bcd__.txt' }], child_dir_id)
      const file_names = [
        {
          name: 'bcd.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: 'bcd.txt', dir_id: child_dir_id
        },
        {
          name: 'bcd.txt', dir_id: child2_dir_id
        },
        {
          name: 'bcd.txt', dir_id: grandchild_dir_id
        },
        {
          name: 'Bcd.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: 'ｂｃｄ.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: '12345.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: '2345.txt', dir_id: grandchild_dir_id
        },
        {
          name: '日本語でOK.txt', dir_id: grandchild_dir_id
        },
        {
          name: '日本語でok.txt', dir_id: child2_dir_id
        },
        {
          name: '金星語でOK.txt', dir_id: child2_dir_id
        },
        {
          name: '謎のファイル１.nazo', dir_id: initData.tenant.home_dir_id
        },
        {
          name: '謎のファイル2.nazo', dir_id: grandchild_dir_id
        },
      ]
      await Promise.all(file_names.map(async item => {
        const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file, name: item.name }], item.dir_id)
      }))
    })

    it(`パラメータ不正'q is empty'の確認: query.qが空の場合はBadRequestエラー`, async () => {
      const req = {
        query: {
          q: '',
          page: 0,  // number
          sort: 'modified', //column name
          order: 'asc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.search(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイル一覧の取得に失敗しました")
      expect(res_body.status.errors.q).toBeTruthy() 
    });

    it(`英文字で検索し、昇順で取得`, async () => {
      const req = {
        query: {
          q: 'bcd',
          page: 0,  // number
          sort: 'modified', //column name
          order: 'asc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.search(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(JSON.stringify(_compact_response(res_body))).toBe(JSON.stringify([
          folderNames[0],
          folderNames[1],
          folderNames[2],
          'bcd.txt',
          'bcd.txt',
          'bcd.txt',
          'bcd.txt'
        ]))
      }
    })

    it(`英文字で検索し、降順で取得`, async () => {
      const req = {
        query: {
          q: 'bcd',
          page: 0,  // number
          //sort: 'name', //column name
          sort: 'modified', //column name
          order: 'desc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.search(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(JSON.stringify(_compact_response(res_body))).toBe(JSON.stringify([
          folderNames[2],
          folderNames[1],
          folderNames[0],
          'bcd.txt',
          'bcd.txt',
          'bcd.txt',
          'bcd.txt',
        ]))
      }
    })

    it(`英文字で検索し、2ページ目を取得`, async () => {
      const req = {
        query: {
          q: 'bcd',
          page: 1,  // number
          sort: 'name', //column name
          order: 'desc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.search(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(JSON.stringify(_compact_response(res_body))).toBe(JSON.stringify([
        ]))
      }
    })

    it(`数字で検索し、昇順で取得`, async () => {
      const req = {
        query: {
          q: '2345',
          page: 0,  // number
          sort: 'modified', //column name
          order: 'asc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.search(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(JSON.stringify(_compact_response(res_body))).toBe(JSON.stringify([
          '2345.txt',
        ]))
      }
    })

    it(`全角文字で検索し、昇順で取得`, async () => {
      const req = {
        query: {
          q: '日本語',
          page: 0,  // number
          sort: 'modified', //column name
          order: 'asc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.search(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(JSON.stringify(_compact_response(res_body))).toBe(JSON.stringify([
          '日本語でOK.txt',
          '日本語でok.txt',
        ]))
      }
    })
  })

  describe(`searchDetail()`, () => {
    let child_dir_id
    let child2_dir_id
    let child3_dir_id
    let grandchild_dir_id
    const folderNames = ['bcd_dir_1_' + testHelper.getUUID(),'bcd_dir_2_' + testHelper.getUUID(),'bcd_dir_3_' + testHelper.getUUID(),'bcd_dir_4_' + testHelper.getUUID(),]
    beforeAll(async () => {
      let result
      await updateAppSetting_InheritParentDirAuth(true)
      // 別ユーザーの作成
      result = await testControllers.addUserInGroup(testHelper.getUUID(), initData.roleMenuMgr._id, initData.groupMgr._id)
      const other_user = result.res.toObject()
      // フォルダ作成
      result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, folderNames[0])
      child_dir_id = result.res.body._id
      // フォルダ作成
      result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, folderNames[1])
      grandchild_dir_id = result.res.body._id
      // フォルダ作成
      result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, folderNames[2])
      child2_dir_id = result.res.body._id
      // フォルダ作成(操作権限のない)
      result = await testControllers.createDirWithSimpleauth({ ...other_user }, initData.tenant.home_dir_id, folderNames[3])
      child3_dir_id = result.res.body._id
      // ファイルアップロード(操作権限のない)
      result = await testControllers.uploadFileWithSimpleauth({ ...other_user }, [{ ...filesData.sample_file, name: 'bcd__.txt' }], child_dir_id)
      const file_names = [
        {
          name: 'bcd.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: 'bcd.txt', dir_id: child_dir_id
        },
        {
          name: 'bcd.txt', dir_id: child2_dir_id
        },
        {
          name: 'bcd.txt', dir_id: grandchild_dir_id
        },
        {
          name: 'Bcd.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: 'ｂｃｄ.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: '12345.txt', dir_id: initData.tenant.home_dir_id
        },
        {
          name: '2345.txt', dir_id: grandchild_dir_id
        },
        {
          name: '日本語でOK.txt', dir_id: grandchild_dir_id
        },
        {
          name: '日本語でok.txt', dir_id: child2_dir_id
        },
        {
          name: '金星語でOK.txt', dir_id: child2_dir_id
        },
        {
          name: '謎のファイル１.nazo', dir_id: initData.tenant.home_dir_id
        },
        {
          name: '謎のファイル2.nazo', dir_id: grandchild_dir_id
        },
      ]
      await Promise.all(file_names.map(async item => {
        const result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file, name: item.name }], item.dir_id)
      }))
    })
    
    it(`英文字で検索し、昇順で取得`, async () => {
      const req = {
        body: {
          queries: [{
            meta_info_id: null,
            search_value_type: 'String',
            value: 'test'
          }],
          page: 0,  // number
          sort: 'modified', //column name
          order: 'asc',  // 'asc' or 'desc'
          is_display_unvisible: 'false' // 'true' or 'false'
        },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.searchDetail(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(JSON.stringify(_compact_response(res_body))).toBe(JSON.stringify([
          folderNames[0],
          folderNames[1],
          folderNames[2],
          'bcd.txt',
          'bcd.txt',
          'bcd.txt',
          'bcd.txt'
        ]))
      }
    })

  })
});

