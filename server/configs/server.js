// mongoの接続先情報
export const SERVER_CONF = {
  development: {
    url: "mongodb://172.16.55.74",  // 社内docker
    // url: "mongodb://192.168.56.10",  // virtualbox
    db_name: "walter",
    port: 3333
  },
  integration: {
    url: "mongodb://172.16.55.74",  // 社内docker
    db_name: "walter",
    port: 3333
  },
  production: {
    url: "mongodb://192.168.56.10",  // とりあえず
    db_name: "walter",
    port: 3333
  }
};

export const STORAGE_CONF = {
  // virtualbox
  development: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    // authUrl: "http://192.168.56.10:8080/auth/v1.0", // virtualbox
    authUrl: "http://172.16.55.75:8080/auth/v1.0",  // 社内docker
    version: 1
  },

  // 社内docker
  integration: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    authUrl: "http://172.16.55.75:8080/auth/v1.0",
    version: 1
  }
};

// パスワードhash用の秘密鍵
// @todo テナント毎に分ける？
export const SECURITY_CONF = {
  development: {
    secretKey: "secretKey"
  },
  migration: {
    secretKey: "secretKey"
  }
};
