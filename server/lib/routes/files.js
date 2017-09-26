import { Router } from "express";
import multer from "multer";
import * as controller from "../controllers/files";

const router = Router();

const upload_path = multer({ dest: "uploads/" });
const fields = upload_path.fields([ { name: "myFile[]" } ]);

// ファイル一覧
router.get("/", controller.index);

// ファイルダウンロード
router.get("/download", controller.download);

// ファイル検索
router.route("/search").get(controller.search);

// ファイル検索項目一覧
router.route("/search_items").get(controller.searchItems);

// 詳細検索
router.route("/search_detail").get(controller.searchDetail);

// ファイルアップロード
router.post("/", fields, controller.upload);

// ファイル詳細
router.route("/:file_id").get(controller.view);

// ファイル名変更
router.route("/:file_id/rename").patch(controller.rename);

// ファイル移動
router.route("/:file_id/move").patch(controller.move);

// タグの追加
router.route("/:file_id/tags").post(controller.addTag);

// タグの削除
router.route("/:file_id/tags/:tag_id").delete(controller.removeTag);

// メタ情報の追加
router.route("/:file_id/meta").post(controller.addMeta);

// メタ情報の削除
router.route("/:file_id/meta/:meta_id").delete(controller.removeMeta);

// お気に入りのトグル
router.route("/:file_id/toggle_star").patch(controller.toggleStar);

export default router;

