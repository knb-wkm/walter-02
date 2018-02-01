import mongoose, { Schema } from "mongoose";

mongoose.Promise = global.Promise;

const AppSettingSchema = Schema({
  tenant_id: Schema.Types.ObjectId,
  name: Schema.Types.String,
  description: Schema.Types.String,
  enable: Schema.Types.Boolean,
  default_value: Schema.Types.Mixed
});

const AppSetting = mongoose.model("app_settings", AppSettingSchema, "app_settings");

export default AppSetting;