import * as memMongo from "../test/memmongo";

import moment from "moment";
import * as _ from "lodash";
import { Swift } from "../storages/Swift";
import * as testHelper from "../test/helper";
import AppSetting from "../models/AppSetting";
import AuthorityFile from "../models/AuthorityFile";

import * as filesData from "../test/filesdata";
import { TestControllers } from "../test/controllers";

import * as file_controller from "../controllers/files";
import * as dir_controller from "../controllers/dirs";

import File from "../models/File";


jest.setTimeout(40000);
const tenant_name = 'test'
let testControllers


describe('lib/controllers/dirs', () => {
  let default_res
  let initData
  let appSetting_InheritParentDirAuth
  //const getDefaultRes = (user, tenant) => {
    //const error_res_json = jest.fn()
    //const res = { user: { ...user, tenant_id: tenant._id, tenant: { ...tenant } }, status: jest.fn(() => ({ json: error_res_json })) }
    //return { res_success: res, res_error: error_res_json }
  //}
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
    await memMongo.disconnect()
  })

  const _clear_file_auth = async file_id => {
    const authes = await AuthorityFile.find({ files: file_id })
    for (let i = 0; i < authes.length; i++){
      const req = {
        params: { file_id },
        query: {
          user_id: authes[i].users,
          group_id: authes[i].groups,
          role_id: authes[i].role_files,
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await file_controller.removeAuthority(req, res)
    }
  }

  const _create_dir_with_simpleauth = async (action_user, dir_id, dir_name) => {
    let result
    result = await testControllers.createDir(action_user, dir_id, dir_name)
    const file_id = result.res.body._id 
    // ここで権限を全て剥奪
    await _clear_file_auth(file_id) 
    return (await testControllers.viewDir(action_user, file_id))
  }

  describe(`create()`, () => {
    beforeAll(async () => {
    })

    it(`パラメータ不正'dir_id is empty'の確認： body.dir_idが空の場合はBadRequestエラー`, async () => {
      const req = {
        body: { dir_id: null, dir_name: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.create(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの作成に失敗しました")
    })

    it(`パラメータ不正'dir_name is empty'の確認： body.dir_nameが空の場合はBadRequestエラー`, async () => {
      const req = {
        body: { dir_id: initData.tenant.home_dir_id, dir_name: null }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.create(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの作成に失敗しました")
    })

    it(`フォルダ作成成功の確認(appSettings.inherit_parent_dir_auth === true): フォルダの情報が返り、その権限は親フォルダの権限を継承し、さらに操作ユーザーのフルコントロールが付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      const req = {
        body: { dir_id: initData.tenant.home_dir_id, dir_name: testHelper.getUUID() }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.create(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(req.body.dir_name) //nameが一致する
        expect(res_body.body.dir_id.toString()).toBe(req.body.dir_id.toString()) //dir_idが一致する
        const myAuthorityFiles = (await AuthorityFile.find({ files: res_body.body._id }))
        const dirAuthorityFiles = (await AuthorityFile.find({ files: initData.tenant.home_dir_id }))
        expect(testHelper.verifyAuth(dirAuthorityFiles, myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy()
      }
    })

    it(`フォルダ作成成功の確認(appSettings.inherit_parent_dir_auth === false): フォルダの情報が返り、その権限は操作ユーザーのフルコントロールのみ付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(false)
      const req = {
        body: { dir_id: initData.tenant.home_dir_id, dir_name: testHelper.getUUID() }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.create(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(req.body.dir_name) //nameが一致する
        expect(res_body.body.dir_id.toString()).toBe(req.body.dir_id.toString()) //dir_idが一致する
        const myAuthorityFiles = (await AuthorityFile.find({ files: res_body.body._id }))
        expect(testHelper.verifyAuth([], myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy()
      }
    })
  })

  describe(`move()`, () => {

    it(`パラメータ不正'moving_id is empty'の確認： params.moving_idが空の場合はBadRequestエラー`, async () => {
      let file_id 
      // フォルダ作成
      const result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
      file_id = result.res.body._id
      const req = {
        params: { moving_id: null },
        body: {
          destinationDir: { _id: null },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.move(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの移動に失敗しました")
    })

    it(`パラメータ不正'destination_id is empty'の確認： body.destinationDir._idが空の場合はBadRequestエラー`, async () => {
      let file_id 
      // フォルダ作成
      const result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
      file_id = result.res.body._id
      const req = {
        params: { moving_id: file_id.toString() },
        body: {
          destinationDir: { _id: null },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.move(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの移動に失敗しました")
    })

    it(`子孫ファイルを持つフォルダの別フォルダへ移動成功を確認(appSettings.inherit_parent_dir_auth === true): 操作後のフォルダの親フォルダが変更され、その権限は親フォルダの権限を継承し、さらに操作ユーザーのフルコントロールが付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      let sub_dir_id
      await (async() => {
        let result
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
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
        // 移動先フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'topsub_'+ testHelper.getUUID())
        sub_dir_id = result.res.body._id
      })()
      const req = {
        params: { moving_id: file_id.toString() },
        body: {
          destinationDir: { _id: sub_dir_id.toString() },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [file_id, child_dir_id, child_file_id, grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await dir_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(sub_dir_id.toString()) //所属フォルダが変更されている
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]
          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致あり
          expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
          expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
        })
      }
    })

    it(`子孫ファイルを持つフォルダをゴミ箱からTOPへ移動成功を確認(appSettings.inherit_parent_dir_auth === true): 操作後のフォルダの親フォルダが変更され、その権限は親フォルダの権限を継承し、さらに操作ユーザーのフルコントロールが付加される`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      await (async() => {
        let result
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'trash_to_top_'+ testHelper.getUUID())
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
        const req = {
          params: { file_id },
        }
        const error_res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
        await file_controller.moveTrash(req, res)
      })()
      const req = {
        params: { moving_id: file_id.toString() },
        body: {
          destinationDir: { _id: initData.tenant.home_dir_id.toString() },
        }
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      const file_id_array = [file_id, child_dir_id, child_file_id, grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await dir_controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.home_dir_id.toString()) //所属フォルダが変更されている
        const diff_list = await Promise.all(file_id_array.map(async id => {
          const file = (await File.findOne({ _id: id }))
          expect(file.is_trash).toBeFalsy() // 移動後はis_trash===false
          const myAuthorityFiles_upd = await AuthorityFile.find({ files: id })
          const myAuthorityFiles_org = myAuthorityFiles_org_list[_.findIndex(myAuthorityFiles_org_list, authes => authes[0].files.toString() === id.toString())]
          return testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        }))
        diff_list.forEach(diff => {
          expect(diff.length).toBe(1) //変更前後で不一致はあり
          expect(diff[0].users.toString()).toBe(initData.user._id.toString()) //差分権限のuser_idが一致
          expect(diff[0].group).toBeFalsy() //差分権限のgroup_idが一致
          expect(diff[0].role_files.toString()).toBe(initData.roleFileReadonly._id.toString()) //差分権限のrolefile_idが一致
          expect(diff[0].is_default).toBeFalsy() 
        })
      }
    })
  })

  describe(`view()`, () => {

    it(`パラメータ不正'dir_id is invalid'の確認： params.dir_idが不正の場合はBadRequestエラー`, async () => {
      let file_id 
      // フォルダ作成
      const result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
      file_id = result.res.body._id
      const req = {
        params: { dir_id: 'xxxxxx' },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.view(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの取得に失敗しました")
    })

    it(`dir_id指定なしにて取得に成功: params.dir_idなしの場合は、TOPの情報を返す`, async () => {
      let file_id 
      // フォルダ作成
      const dir_name = 'top_'+ testHelper.getUUID() 
      const result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, dir_name )
      file_id = result.res.body._id
      const req = {
        params: { dir_id: null },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.view(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe('Top') //nameが一致する
        expect(res_body.body._id.toString()).toBe(initData.tenant.home_dir_id.toString()) //dir_idが一致する
      }
    })

    it(`dir_idを指定して取得に成功: 指定のフォルダの情報を返す`, async () => {
      let file_id 
      // フォルダ作成
      const dir_name = 'top_'+ testHelper.getUUID() 
      const result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, dir_name )
      file_id = result.res.body._id
      const req = {
        params: { dir_id: file_id },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.view(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(dir_name) //nameが一致する
        expect(res_body.body._id.toString()).toBe(file_id.toString()) //dir_idが一致する
      }
    })
  })

  describe(`tree()`, () => {
    it(`パラメータ不正'root_id is empty'の確認： params.dir_idが不正の場合はBadRequestエラー`, async () => {
      let file_id 
      const req = {
        query: { root_id: null },
      }
      const error_res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.tree(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = error_res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダツリーの取得に失敗しました")
    })

    it(`子孫ファイルを持つフォルダのtreeの取得成功を確認: `, async () => {
      let root_dir_id 
      let child_dir_id 
      let child2_dir_id 
      let child3_dir_id 
      let child_file_id 
      let grandchild_file_id
      let grandchild_dir_id
      
      await (async() => {
        let result
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, initData.tenant.home_dir_id, 'tree_top_'+ testHelper.getUUID())
        root_dir_id = result.res.body._id
        // フォルダへ権限追加
        result = await testControllers.addAuthority(root_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], root_dir_id)
        child_file_id = result.res.body[0]._id
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, root_dir_id, testHelper.getUUID())
        child_dir_id = result.res.body._id
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, root_dir_id, testHelper.getUUID())
        child2_dir_id = result.res.body._id
        // フォルダ作成(操作権限のない)
        result = await testControllers.addUserInGroup(testHelper.getUUID(), initData.roleMenuMgr._id, initData.groupMgr._id)
        const other_user = result.res.toObject()
        result = await testControllers.createDirWithSimpleauth({ ...other_user }, root_dir_id, testHelper.getUUID())
        child3_dir_id = result.res.body._id
        // ファイルアップロード(操作権限のない)
        result = await testControllers.uploadFileWithSimpleauth({ ...other_user }, [{ ...filesData.sample_file }], root_dir_id)
        //child2_file_id = result.res.body[0]._id
        // ファイルアップロード
        result = await testControllers.uploadFile({ ...initData.user }, [{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        // フォルダ作成
        result = await testControllers.createDir({ ...initData.user }, child_dir_id, testHelper.getUUID())
        grandchild_dir_id = result.res.body._id
        const req = {
          params: { file_id: root_dir_id },
        }
        const error_res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
        await file_controller.moveTrash(req, res)
      })()

       let req = {
        query: { root_id: root_dir_id },
      }
      let error_res_json = jest.fn()
      let res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.tree(req, res) // root_dir_idのchildrenを取得
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(_.union(res_body.body.children.map(c => c._id.toString()), [child_dir_id.toString(), child2_dir_id.toString() ]).length).toBe(2)
      }

      req = {
        query: { root_id: child_dir_id },
      }
      error_res_json = jest.fn()
      res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
      await dir_controller.tree(req, res) // root_dir_idのchildrenを取得
      if (res.json.mock.calls.length === 0) {
        expect(error_res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(_.union(res_body.body.children.map(c => c._id.toString()), [grandchild_dir_id.toString() ]).length).toBe(1)
      }
    })
  })
    

  describe(`index()は未使用`, () => {
  })

});

