import * as memMongo from "../test/memmongo";

import moment from "moment";
import * as _ from "lodash";
import { Swift } from "../storages/Swift";
import * as testHelper from "../test/helper";
import AppSetting from "../models/AppSetting";
import AuthorityFile from "../models/AuthorityFile";

import * as controller from "../controllers/metaInfos";


jest.setTimeout(40000);
const tenant_name = 'test'


describe('lib/controllers/metaInfos', () => {
  let default_res
  let initData
  beforeAll(async () => {
    initData = await memMongo.connect(tenant_name)
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
    it(`name is empty`, async () => {
      const req = {
        body: {
          metainfo: {
            name: null, label: 'meta', value: {name:'String'} 
          }
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.add(req, res)
      expect(res.status.mock.calls[0][0]).toBe(400) // http response statusは400
      const res_body = res_json.mock.calls[0][0] //1回目の第一引数
      expect(res_body.status.success).toBe(false)
      expect(res_body.status.message).toBe("メタ情報の登録に失敗しました")
    })
    it(`成功`, async () => {
      const req = {
        body: {
          metainfo: {
            name: testHelper.getUUID(), label: testHelper.getUUID(), value_type: 'String' 
          }
        }
      }
      const res_json = jest.fn()
      const res = { user: { ...default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_json })) }
      await controller.add(req, res)
      if (res.json.mock.calls.length === 0) {
        expect(res_json.mock.calls[0][0].status.errors).toBe('failed')
      } else {
        const res_body = res.json.mock.calls[0][0] //1回目の第一引数
        expect(res_body.status.success).toBe(true)
        expect(res_body.body.name).toBe(req.body.metainfo.name) //nameが一致する
        expect(res_body.body.label).toBe(req.body.metainfo.label) //labelが一致する
      }
    })
  })
});

