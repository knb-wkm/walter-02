import analyze from "./analyze";
import initElasticsearch, { reCreateElasticCache } from "./initElasticsearch";
import moveInvisibleFiles from "./moveInvisibleFiles";
import createAdmin from "./createAdmin";
import deleteAdmin from "./deleteAdmin";

export const AnalyzeTask = () => analyze();

export const initElasticsearchTask = () => initElasticsearch();

export const reCreateElasticCacheTask = () => reCreateElasticCache();

export const moveInvisibleFilesTask = () => moveInvisibleFiles();

export const createAdminTask = () => createAdmin();

export const deleteAdminTask = () => deleteAdmin();
