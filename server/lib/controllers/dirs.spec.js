import * as memMongo from "../test/memmongo";

import moment from "moment";
import * as _ from "lodash";
import { Swift } from "../storages/Swift";
import * as testHelper from "../test/helper";
import AppSetting from "../models/AppSetting";
import AuthorityFile from "../models/AuthorityFile";

import * as filesData from "../test/filesdata";

import * as files_controller from "../controllers/files";
import * as controller from "../controllers/dirs";

import File from "../models/File";


jest.setTimeout(40000);
const tenant_name = 'test'


describe('lib/controllers/dirs', () => {
  let default_res
  let initData
  let appSetting_InheritParentDirAuth
  const updateAppSetting_InheritParentDirAuth = async value => {
    appSetting_InheritParentDirAuth.enable = value
    await appSetting_InheritParentDirAuth.save()
  }
  beforeAll(async () => {
    initData = await memMongo.connect(tenant_name)
    default_res = {
      user: { ...initData.user, tenant_id: initData.tenant._id, tenant: { ...initData.tenant } }
    }
    appSetting_InheritParentDirAuth = await AppSetting.findOne({ tenant_id: initData.tenant._id, name: 'inherit_parent_dir_auth' })
  })
  afterAll(async () => {
    await memMongo.disconnect()
  })

  const _upload_file = async (files_array, dir_id) => {
    const req = {
      body: { files: files_array, dir_id }
    }
    const res_error_json = jest.fn()
    const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_error_json })) }
    await files_controller.upload(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: res_error_json.mock.calls[0][0].status.errors}
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }

  const _add_authority = async (file_id, user, group, role) => {
    const req = {
      params: { file_id },
      body: {
        user: user,
        group: group,
        role: role,
      }
    }
    const res_error_json = jest.fn()
    const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_error_json })) }
    await files_controller.addAuthority(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: res_error_json.mock.calls[0][0].status.errors}
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }
  const _create_dir = async (user, dir_id, dir_name) => {
    const req = {
      body: { dir_id, dir_name }
    }
    const res_error_json = jest.fn()
    const res = { user: { ...user }, json: jest.fn(), status: jest.fn(() => ({ json: res_error_json })) }
    await controller.create(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: res_error_json.mock.calls[0][0].status.errors}
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }

  describe(`create()`, () => {
    beforeAll(async () => {
    })
    it(`dir_id is empty`, async () => {
      const req = {
        body: { dir_id: null, dir_name: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.create(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの作成に失敗しました")
    })
    it(`dir_name is empty`, async () => {
      const req = {
        body: { dir_id: initData.tenant.home_dir_id, dir_name: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.create(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの作成に失敗しました")
    })
    it(`成功  appSettings.inherit_parent_dir_auth === true`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      const req = {
        body: { dir_id: initData.tenant.home_dir_id, dir_name: testHelper.getUUID() }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.create(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功  appSettings.inherit_parent_dir_auth === false`, async () => {
      await updateAppSetting_InheritParentDirAuth(false)
      const req = {
        body: { dir_id: initData.tenant.home_dir_id, dir_name: testHelper.getUUID() }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.create(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`moving_id is empty`, async () => {
      let file_id 
      // フォルダ作成
      const result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
      file_id = result.res.body._id
      const req = {
        params: { moving_id: null },
        body: {
          destinationDir: { _id: null },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.move(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの移動に失敗しました")
    })
    it(`destination_id is empty`, async () => {
      let file_id 
      // フォルダ作成
      const result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
      file_id = result.res.body._id
      const req = {
        params: { moving_id: file_id.toString() },
        body: {
          destinationDir: { _id: null },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.move(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("フォルダの移動に失敗しました")
    })
    it(`成功 子フォルダへ移動`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      let sub_dir_id
      await (async() => {
        let result
        // フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
        file_id = result.res.body._id
        // フォルダへ権限追加
        result = await _add_authority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // ファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], file_id)
        child_file_id = result.res.body[0]._id
        // フォルダ作成
        result = await _create_dir({ ...initData.user }, file_id, testHelper.getUUID())
        child_dir_id = result.res.body._id
        // ファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        // サブフォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'topsub_'+ testHelper.getUUID())
        sub_dir_id = result.res.body._id
      })()
      const req = {
        params: { moving_id: file_id.toString() },
        body: {
          destinationDir: { _id: sub_dir_id.toString() },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [file_id, child_dir_id, child_file_id, grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 ゴミ箱から一般へ移動`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      await (async() => {
        let result
        // フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'trash_to_top_'+ testHelper.getUUID())
        file_id = result.res.body._id
        // フォルダへ権限追加
        result = await _add_authority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // ファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], file_id)
        child_file_id = result.res.body[0]._id
        // フォルダ作成
        result = await _create_dir({ ...initData.user }, file_id, testHelper.getUUID())
        child_dir_id = result.res.body._id
        // ファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        const req = {
          params: { file_id },
        }
        const res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
        await files_controller.moveTrash(req, res)
      })()
      const req = {
        params: { moving_id: file_id.toString() },
        body: {
          destinationDir: { _id: initData.tenant.home_dir_id.toString() },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [file_id, child_dir_id, child_file_id, grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`dir_id is invalid`, async () => {
      let file_id 
      // フォルダ作成
      const result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'top_'+ testHelper.getUUID())
      file_id = result.res.body._id
      const req = {
        params: { dir_id: 'xxxxxx' },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.view(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの取得に失敗しました")
    })
    it(`成功 dir_id指定なしの場合は、TOPの情報を返す`, async () => {
      let file_id 
      // フォルダ作成
      const dir_name = 'top_'+ testHelper.getUUID() 
      const result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, dir_name )
      file_id = result.res.body._id
      const req = {
        params: { dir_id: null },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.view(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe('Top') //nameが一致する
        expect(res_body.body._id.toString()).toBe(initData.tenant.home_dir_id.toString()) //dir_idが一致する
      }
    })
    it(`成功 dir_id指定の情報を返す`, async () => {
      let file_id 
      // フォルダ作成
      const dir_name = 'top_'+ testHelper.getUUID() 
      const result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, dir_name )
      file_id = result.res.body._id
      const req = {
        params: { dir_id: file_id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.view(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(dir_name) //nameが一致する
        expect(res_body.body._id.toString()).toBe(file_id.toString()) //dir_idが一致する
      }
    })
  })
  describe(`tree()`, () => {
  })
  describe(`index?()`, () => {
  })

});

