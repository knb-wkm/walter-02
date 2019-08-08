import * as memMongo from "../test/memmongo";

import * as _ from "lodash";

import * as controller from "../controllers/files";
import * as dir_controller from "../controllers/dirs";
import * as metainfo_controller from "../controllers/metaInfos";

import * as filesData from "../test/filesdata";
import * as testHelper from "../test/helper";
import AppSetting from "../models/AppSetting";
import AuthorityFile from "../models/AuthorityFile";
import FileMetaInfo from "../models/FileMetaInfo";
import File from "../models/File";
import Tag from "../models/Tag";

jest.setTimeout(40000);
const tenant_name = 'test'

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

  const _upload_file = async (files_array, dir_id) => {
    const req = {
      body: { files: files_array, dir_id }
    }
    const res_error_json = jest.fn()
    const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_error_json })) }
    await controller.upload(req, res)
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
    await controller.addAuthority(req, res)
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
    await dir_controller.create(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: res_error_json.mock.calls[0][0].status.errors}
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }
  const _add_metainfo = async (value_type) => {
    const req = {
      body: {
        metainfo: {
          name: testHelper.getUUID(), label: testHelper.getUUID(), value_type 
        }
      }
    }
    const res_json = jest.fn()
    const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
    await metainfo_controller.add(req, res)
    const res_body = res.json.mock.calls[0][0] //1回目の第一引数
    return res_body.body
  }
  describe(`upload()`, () => {
    it(`テナント情報の取得`, async () => {
      expect(tenant_name).toBe(initData.tenant.name)
    })

    it(`files is empty`, async () => {
      const req = {
        body: { files: [] }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: res_json })) }
      await controller.upload(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルのアップロードに失敗しました")
      expect(res_body.status.errors.files).toBeTruthy() //権限が正しい
    });
    it(`1ファイル成功 appSettings.inherit_parent_dir_auth === true`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
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
    it(`3ファイル成功 appSettings.inherit_parent_dir_auth === true`, async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      const result = await _upload_file([{ ...filesData.sample_file }, { ...filesData.sample_file }, { ...filesData.sample_file }], initData.tenant.home_dir_id)
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
    it(`1ファイル成功 appSettings.inherit_parent_dir_auth === false`, async () => {
      await updateAppSetting_InheritParentDirAuth(false)
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        expect(result.res.status.success).toBe(true)
        expect(result.res.body.length).toBe(1) //１ファイルの結果が返る
        const myAuthorityFiles = (await AuthorityFile.find({ files: result.res.body[0]._id }))
        expect(testHelper.verifyAuth([], myAuthorityFiles, initData.user, initData.roleFileFull._id)).toBeTruthy()
      } else {
        expect(result.errors).toBe('* 想定外なエラー')
      }
    });
    it(`3ファイル成功 appSettings.inherit_parent_dir_auth === false`, async () => {
      await updateAppSetting_InheritParentDirAuth(false)
      const result = await _upload_file([{ ...filesData.sample_file }, { ...filesData.sample_file }, { ...filesData.sample_file }], initData.tenant.home_dir_id)
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })
    it(`file_idが空です`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null}
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.view(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの取得に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.view(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.rename(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイル名の変更に失敗しました")
    })
    it(`name is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {name: ''}
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.rename(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイル名の変更に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const new_name = 'new_name'
      const req = {
        params: { file_id },
        body: { name: new_name }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.rename(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の追加に失敗しました")
    })
    it(`成功 ユーザーの読み取り権限追加`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {
          user: { ...initData.user },
          group: null,
          role: { ...initData.roleFileReadonly },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`同一権限追加はエラー ユーザーの読み取り権限追加`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {
          user: { ...initData.user },
          group: null,
          role: { ...initData.roleFileReadonly },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.addAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の追加に失敗しました")
      const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
      const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
      expect(diff.length).toBe(0) //変更前後で不一致なし
    })
    it(`成功 グループの読み取り権限追加`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {
          user: null,
          group: { ...initData.groupMgr },
          role: { ...initData.roleFileReadonly },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`同一権限追加はエラー グループの読み取り権限追加`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {
          user: null,
          group: { ...initData.groupMgr },
          role: { ...initData.roleFileReadonly },
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.addAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の追加に失敗しました")
      const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
      const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
      expect(diff.length).toBe(0) //変更前後で不一致なし
    })
    it(`成功 親フォルダへの読み取り権限追加(user)`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await _create_dir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
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
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 親フォルダへの読み取り権限追加(group)`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await _create_dir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
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
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.addAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        const result2 = await _add_authority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        if (result2.success) {
          const result3 = await _add_authority(file_id, null, {...initData.groupMgr}, { ...initData.roleFileReadonly })
          if (result3.success) {
          } else {
            console.log(result3.errors)
          }
        } else {
          console.log(result2.errors)
        }
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeAuthority(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルへの権限の削除に失敗しました")
    })
    it(`成功 ユーザーの読み取り権限削除(user)`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        query: {
          user_id: initData.user._id,
          group_id: null,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`role is empty (user)`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        query: {
          user_id: initData.user._id,
          group_id: null,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(0) //変更前後で不一致なし
      }
    })
    it(`成功 ユーザーの読み取り権限削除(group)`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        query: {
          user_id: null,
          group_id: initData.groupMgr._id,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`role is empty (group)`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        query: {
          user_id: null,
          group_id: initData.groupMgr._id,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(0) //変更前後で不一致なし
      }
    })
    it(`成功 親フォルダの読み取り権限削除(user)`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await _create_dir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        result = await _add_authority(parent_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id: parent_dir_id },
        query: {
          user_id: initData.user._id,
          group_id: null,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 親フォルダの読み取り権限削除(group)`, async () => {
      let parent_dir_id 
      let child_dir_id
      let child_file_id
      let grandchild_file_id
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        parent_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], parent_dir_id)
        child_file_id = result.res.body[0]._id
        // 親フォルダへ子フォルダ作成
        result = await _create_dir({ ...initData.user }, parent_dir_id, 'child')
        child_dir_id = result.res.body._id
         // 子フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
        grandchild_file_id = result.res.body[0]._id
        result = await _add_authority(parent_dir_id, null, { ...initData.groupMgr }, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id: parent_dir_id },
        query: {
          user_id: null,
          group_id: initData.groupMgr._id,
          role_id: initData.roleFileReadonly._id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [parent_dir_id,child_dir_id,child_file_id,grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.removeAuthority(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        tag_id = (await Tag.findOne({}))._id
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの追加に失敗しました")
    })
    it(`tag_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {_id: ''}
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの追加に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {_id: tag_id}
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addTag(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file = (await File.findOne({ _id: file_id }))
        expect(file.tags[0]._id.toString()).toBe(tag_id.toString())
      }
    })
  })
  describe(`removeTag()`, () => {
    let file_id = null
    let tag_id = null
    beforeAll(async () => {
      await updateAppSetting_InheritParentDirAuth(true)
      // 事前にファイルをアップロード
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        tag_id = (await Tag.findOne({}))._id
        const req = {
          params: { file_id },
          body: {_id: tag_id}
        }
        const res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
        await controller.addTag(req, res)
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの削除に失敗しました")
    })
    it(`tag_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: {_id: ''}
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeTag(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("タグの削除に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id, tag_id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeTag(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        meta = await _add_metainfo('String')
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null },
        body: { meta: { _id: null }, value: '' }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の追加に失敗しました")
    })
    it(`meta_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: { meta: { _id: null }, value: '' }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の追加に失敗しました")
    })
    it(`metainfo value is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: { meta: { _id: meta.id }, value: '' }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の追加に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
        body: { meta: { _id: meta.id }, value: 'qqqqq' }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.addMeta(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
        meta = await _add_metainfo('String')
        const req = {
          params: { file_id },
          body: { meta: { _id: meta.id }, value: 'qqqqq' }
        }
        const res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
        await controller.addMeta(req, res)
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の削除に失敗しました")
    })
    it(`meta_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id, meta_id:null },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeMeta(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の削除に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id, meta_id: meta.id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.removeMeta(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      if (result.success) {
        file_id = result.res.body[0]._id
      } else {
        console.log(result.errors)
      }
    })
    it(`file_id is empty`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.toggleStar(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルのお気に入りの設定に失敗しました")
    })
    it(`成功`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file = (await File.findOne({ _id: file_id }))
      const is_star_org = file.is_star
      await controller.toggleStar(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.is_star).toBe(!is_star_org) // is_starが反転する
      }
    })
    it(`成功(再反転)`, async () => {
      if (!file_id) { expect('').toBe('前処理に失敗'); return }
      const req = {
        params: { file_id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file = (await File.findOne({ _id: file_id }))
      const is_star_org = file.is_star
      await controller.toggleStar(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.is_star).toBe(!is_star_org) // is_starが反転する
      }
    })
  })
  describe(`moveTrash()`, () => {
    it(`file_id is empty`, async () => {
      const req = {
        params: { file_id: null }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.moveTrash(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ゴミ箱への移動に失敗しました")
    })
    it(`成功 file`, async () => {
      let file_id = null
      let is_trash_org
      await (async() => {
        let result
        // ファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
        file_id = result.res.body[0]._id
        is_trash_org = result.res.body[0].is_trash 
        // ファイルへ権限追加
        result = await _add_authority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.moveTrash(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        const file_upd = (await File.findOne({ _id: file_id }))
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.trash_dir_id.toString()) //所属フォルダが変更されている
        expect(is_trash_org).toBeFalsy() // 移動前はis_trash===false
        expect(file_upd.is_trash).toBeTruthy() // 移動後はis_trash===true
        expect(file_upd.dir_id.toString()).toBe(initData.tenant.trash_dir_id.toString()) //所属フォルダが変更されている
        const myAuthorityFiles_upd = (await AuthorityFile.find({ files: file_id }))
        const diff = testHelper.authDiff(myAuthorityFiles_org, myAuthorityFiles_upd)
        expect(diff.length).toBe(0) //変更前後で不一致はなし
      }
    })
    it(`成功 dirs`, async () => {
      let file_id 
      let child_dir_id 
      let child_file_id 
      let grandchild_file_id 
      await (async() => {
        let result
        // フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'trash_parent'+ testHelper.getUUID())
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
      })()
      const req = {
        params: { file_id },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [file_id, child_dir_id, child_file_id, grandchild_file_id]      
      const myAuthorityFiles_org_list = await Promise.all(file_id_array.map(async id => await AuthorityFile.find({ files: id })))
      await controller.moveTrash(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`files is empty`, async () => {
      const req = {
        params: { file_id: null },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: res_json })) }
      await controller.move(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの移動に失敗しました")
      expect(res_body.status.errors.file_id).toBeTruthy() 
    });
    it(`dir_id is empty`, async () => {
      const result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
      const file_id = result.res.body[0]._id
      const req = {
        params: { file_id },
        body: {
          dir_id: null,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, status: jest.fn(() => ({ json: res_json })) }
      await controller.move(req, res)

      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("ファイルの移動に失敗しました")
      expect(res_body.status.errors.dir_id).toBeTruthy() //権限が正しい
    });
    it(`成功 子フォルダへ移動 権限の増加(user)`, async () => {
      let child_dir_id 
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        child_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
        file_id = result.res.body[0]._id
        // 親フォルダへ権限追加
        result = await _add_authority(child_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: child_dir_id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 子フォルダへ移動 権限の増加(group)`, async () => {
      let child_dir_id 
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        child_dir_id = result.res.body._id
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], initData.tenant.home_dir_id)
        file_id = result.res.body[0]._id
        // 親フォルダへ権限追加
        result = await _add_authority(child_dir_id, null, { ...initData.groupMgr }, { ...initData.roleFileReadonly })
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: child_dir_id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 親フォルダへ移動 権限の減少(user)`, async () => {
      let child_dir_id 
      await (async() => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent'+ testHelper.getUUID())
        child_dir_id = result.res.body._id
        // 親フォルダへ権限追加
        result = await _add_authority(child_dir_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
        file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 親フォルダへ移動 権限の減少(group)`, async () => {
      let child_dir_id
      await (async () => {
        let result
        // TOP直下へ親フォルダ作成
        result = await _create_dir({ ...initData.user }, initData.tenant.home_dir_id, 'parent' + testHelper.getUUID())
        child_dir_id = result.res.body._id
        // 親フォルダへ権限追加
        result = await _add_authority(child_dir_id, null, { ...initData.groupMgr }, { ...initData.roleFileReadonly })
        // 親フォルダへファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], child_dir_id)
        file_id = result.res.body[0]._id
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const myAuthorityFiles_org = (await AuthorityFile.find({ files: file_id }))
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
    it(`成功 ゴミ箱から一般へ移動: 権限はis_defaultを除いて親フォルダ権限へ洗い替え`, async () => {
      let file_id 
      await (async() => {
        let result
        // ファイルアップロード
        result = await _upload_file([{ ...filesData.sample_file }], file_id)
        file_id = result.res.body[0]._id
        // フォルダへ権限追加
        result = await _add_authority(file_id, { ...initData.user }, null, { ...initData.roleFileReadonly })
        const req = {
          params: { file_id },
        }
        const res_json = jest.fn()
        const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
        await controller.moveTrash(req, res)
      })()
      const req = {
        params: { file_id },
        body: {
          dir_id: initData.tenant.home_dir_id,
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      const file_id_array = [file_id]      
      await controller.move(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
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
  })
});

