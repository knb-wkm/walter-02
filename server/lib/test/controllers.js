import * as user_controller from "../controllers/users";
import * as file_controller from "../controllers/files";
import * as dir_controller from "../controllers/dirs";
import * as metainfo_controller from "../controllers/metaInfos";



class TestControllers {
  constructor(user, tenant) {
    this.default_res = {
      user: { ...user, tenant_id: tenant._id, tenant: { ...tenant } }
    }
  }

  async addUser(name, role_id){
    const req = {
      body: {
        user: {
          name: name,
          role_id: role_id,
          account_name: name,
          password: 'test',
          enabled: true
        }
      }
    }
    const res_error_json = jest.fn()
    const res = { user: { ...this.default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_error_json })) }
    await user_controller.add(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: res_error_json.mock.calls[0][0].status.errors }
    } else {
      return { success: true, res: res.json.mock.calls[0][0].body }
    }
  }

  async addUserInGroup(name, role_id, group_id){
    const add_user_res = await this.addUser(name, role_id)
    const req = {
      params: { user_id: add_user_res.res._id },
      body: {
        group_id: group_id
      }
    }
    const res_error_json = jest.fn()
    const res = { user: { ...this.default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: res_error_json })) }
    await user_controller.addUserToGroup(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: res_error_json.mock.calls[0][0].status.errors }
    } else {
      return { success: true, res: res.json.mock.calls[0][0].body }
    }
  }
  
  async uploadFile(files_array, dir_id){
    const req = {
      body: { files: files_array, dir_id }
    }
    const error_res_json = jest.fn()
    const res = { user: { ...this.default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
    await file_controller.upload(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: error_res_json.mock.calls[0][0].status.errors }
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }

  // files.addAuthority()のラッパー
  async addAuthority(file_id, user, group, role){
    const req = {
      params: { file_id },
      body: {
        user: user,
        group: group,
        role: role,
      }
    }
    const error_res_json = jest.fn()
    const res = { user: { ...this.default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
    await file_controller.addAuthority(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: error_res_json.mock.calls[0][0].status.errors }
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }

  // Dirs.create()のラッパー 
  async createDir(user, dir_id, dir_name){
    const req = {
      body: { dir_id, dir_name }
    }
    const error_res_json = jest.fn()
    const res = { user: { ...user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
    await dir_controller.create(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: error_res_json.mock.calls[0][0].status.errors }
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }

  // Dirs.view()のラッパー 
  async viewDir(dir_id){
    const req = {
      params: { dir_id },
    }
    const error_res_json = jest.fn()
    const res = { user: { ...this.default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
    await dir_controller.view(req, res)
    if (res.json.mock.calls.length === 0) {
      return { success: false, errors: error_res_json.mock.calls[0][0].status.errors }
    } else {
      return { success: true, res: res.json.mock.calls[0][0] }
    }
  }

  // metainfos.add()のラッパー
  async addMetainfo(name,label,value_type){
    const req = {
      body: {
        metainfo: {
          name: name, label: label, value_type 
        }
      }
    }
    const error_res_json = jest.fn()
    const res = { user: { ...this.default_res.user }, json: jest.fn(), status: jest.fn(() => ({ json: error_res_json })) }
    await metainfo_controller.add(req, res)
    const res_body = res.json.mock.calls[0][0] //1回目の第一引数
    return res_body.body
  }}

export { TestControllers }
