import * as fs from "fs";
import * as _ from "lodash";

import Tenant from "../models/Tenant";
import User from "../models/Tenant";

export const loadResourceFile = name => {
  return fs.readFileSync("./lib/test/resources/" + name);
}

export const sleep = time => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export const getUser = async (tenant_name, account_name) => {
  const tenant = await Tenant.findOne({
    name: tenant_name
  })
  const user = await User.findOne({
    tenant_id: tenant.id.toString(),
    account_name
  })
  return user
}

export const getUUID = ()=>{
    // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
    // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case "x":
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case "y":
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join("");
}

const compare = (a, b) => (a ? a.toString() : '') === (b ? b.toString() : '')

export const authDiff = (auth1, auth2) => {
  const diff1 = _.differenceWith(auth1, auth2, (a, b) => {
    return compare(a.role_files, b.role_files) && compare(a.users, b.users) && compare(a.groups, b.groups)
  })
  const diff2 = _.differenceWith(auth2, auth1, (a, b) => {
    return compare(a.role_files, b.role_files) && compare(a.users, b.users) && compare(a.groups, b.groups)
  })
  return diff1.concat(diff2)
}

export const verifyAuth = (auth1, auth2, user, full_controll_id) => {
  const diff = authDiff(auth1, auth2)
  if (user === null && diff.length === 0) return true
  // 差がある場合は、ユーザー自身のフルコントロールが追加されている
  if (user && compare(diff[0].users, user._id) && compare(diff[0].role_files, full_controll_id) && diff[0].is_default) return true
  return false
}

export const stop_test = message => {
  throw new Error('This test was force-stop: ' + message)
}

export const check_preprocess_success = param => {
  if(!param) stop_test('テストの前処理に失敗したため続行できません')
}
