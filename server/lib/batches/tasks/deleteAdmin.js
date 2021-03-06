import mongoose from "mongoose";
import co from "co";

// logger
import logger from "../../logger";

// models
import User from "../../models/User";
import Tenant from "../../models/Tenant";
import RoleMenu from "../../models/RoleMenu";
import AuthorityMenu from "../../models/AuthorityMenu";

const task = () => {
  co(function* () {
		try {
      console.log("################# delete admin start #################");
			const tenant_name = process.argv[3];
			if ( tenant_name === undefined ) throw "テナントを指定してください";

			console.log("tenant name: " + tenant_name);

			const tenant = yield Tenant.findOne({name:tenant_name});
			if (tenant === null) throw "指定されたテナントが見つかりません";

			const admin_user = yield User.findOne({account_name:"admin"});

			if(admin_user === null) throw "管理者は存在しません";

			yield RoleMenu.remove({name:"システム管理者"});
			yield AuthorityMenu.remove({users:admin_user});
			yield User.remove({account_name:"admin"});

			console.log("システム管理者を削除しました");
      console.log("################# delete admin end #################");

		} catch (error) {
      logger.error(error);
			console.log(error);
		} finally{

			process.exit();
		}


	});
};

export default task;