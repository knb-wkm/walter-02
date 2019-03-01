// mongoの接続先情報
export const SERVER_CONF = {
  development: {
    url: "mongodb://mongo",  // 社内docker
    // url: "mongodb://192.168.56.10",  // virtualbox
    db_host: "mongo",
    db_name: "walter",
    port: 3333
  },
  integration: {
    url: "mongodb://172.16.55.74",  // 社内docker
    db_host: "172.16.55.74",
    db_name: "walter",
    port: 3333
  },
  production: {
    url: `mongodb://${process.env.MONGO_HOST_NAME}`,
    db_host: process.env.MONGO_HOST_NAME,
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
    authUrl: "http://swift:8080/auth/v1.0",  // 社内docker
    version: 1
  },

  // 社内docker
  integration: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    authUrl: "http://172.16.55.75:8080/auth/v1.0",
    version: 1
  },

  production: {
    provider: "openstack",
    username: "test:tester",
    password: "testing",
    authUrl: `http://${process.env.SWIFT_HOST_NAME}:8080/auth/v1.0`,
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


// elasticsearchの設定
export const ELASTICSEARCH_CONF = {
  development: {
    host: "elastic",
    port: "9200",
    logLevel: "error"
  },
  integration: {
    host: "192.168.99.100",
    port: "9200",
    logLevel: "error"
  },
  production: {
    host: process.env.ELASTIC_HOST_NAME,
    port: "9200",
    logLevel: "error"
  }
};

// Timestamp APIの設定
export const TIMESTAMP_API_CONF = {
  development: {
    url: "http://timestamp_client_api",
    port: "80",
    apiVersion: "v1",
    logLevel: "error"
  },
  integration: {
    host: "timestamp_client_api",
    port: "80",
    apiVersion: 'v1',
    logLevel: "error"
  },
  production: {
    host: process.env.TIMESTAMP_API_BASE_URL,
    port: "80",
    apiVersion: 'v1',
    logLevel: "error"
  }
};
