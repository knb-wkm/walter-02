import * as memMongo from "../test/memmongo";

import moment from "moment";
import * as _ from "lodash";
import { Swift } from "../storages/Swift";
import * as testHelper from "../test/helper";
import { TestControllers } from "../test/controllers";
//import * as testController from "../test/controllers";
import AppSetting from "../models/AppSetting";
import AuthorityFile from "../models/AuthorityFile";

import * as user_controller from "../controllers/users";



jest.setTimeout(40000);
const tenant_name = 'test'
let testControllers

describe('lib/controllers/users', () => {
  let default_res
  let initData
  beforeAll(async () => {
    initData = await memMongo.connect(tenant_name)
    testControllers = new TestControllers(initData.user,initData.tenant)
    default_res = {
      user: { ...initData.user, tenant_id: initData.tenant._id, tenant: { ...initData.tenant } }
    }
  })
  afterAll(async () => {
    await memMongo.disconnect()
  })

  describe(`add()`, () => {
    beforeAll(async () => {
    })
    it(`userの追加成功を確認: `, async () => {
      const req = {
        body: {
          user: {
            name: testHelper.getUUID(),
            role_id: initData.roleMenuMgr._id,
            account_name: testHelper.getUUID(),
            password: 'test',
            enabled: true
          }
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await user_controller.add(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(req.body.user.name) //nameが一致する
      }
    })
  })

  describe(`addUserToGroup()`, () => {
    beforeAll(async () => {
    })
    it(`userへのグループ追加成功を確認: `, async () => {
      const add_user_res = await testControllers.addUser(testHelper.getUUID(),initData.roleMenuMgr._id)
      const req = {
        params: { user_id: add_user_res.res._id},
        body: {
          group_id: initData.groupMgr._id
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await user_controller.addUserToGroup(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.groups[0].toString()).toBe(req.body.group_id.toString()) //group_idが一致する
      }
    })
  })

  describe(`removeUserOfGroup()`, () => {
    beforeAll(async () => {
    })
    it(`userのグループ削除成功を確認: `, async () => {
      const add_user_res = await testControllers.addUserInGroup(testHelper.getUUID(), initData.roleMenuMgr._id, initData.groupMgr._id)
      const req = {
        params: {
          user_id: add_user_res.res._id,
          group_id: initData.groupMgr._id
        },
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await user_controller.removeUserOfGroup(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.groups.length).toBe(0) //group_idがなくなる
      }
    })
  })
});

