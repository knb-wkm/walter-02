import { Router } from "express";
import BeforeRouter from "./before";
import LoginRouter from "./login";
import UserRouter from "./users";
import FileRouter from "./files";
import DirRouter from "./dirs";
import TagRouter from "./tags";
import MetaInfoRouter from "./metaInfos";
import GroupRouter from "./groups";
import RoleFileRouter from "./roleFiles";
import ActionRouter from "./actions";
import AnalysisRouter from "./analysis";
import ClientRouter from "./clients";
import PreviewRouter from "./previews";
import AuthorityFileRouter from "./authorityFiles";

// debug
import TestRouter from "./test";

const router = Router();

router.use("/",ClientRouter);

router.use("/api/v1/*", BeforeRouter);
router.use("/api/login", LoginRouter);
router.use("/api/v1/users", UserRouter);
router.use("/api/v1/files", FileRouter);
router.use("/api/v1/dirs", DirRouter);
router.use("/api/v1/tags", TagRouter);
router.use("/api/v1/meta_infos", MetaInfoRouter);
router.use("/api/v1/groups", GroupRouter);
router.use("/api/v1/roles", RoleFileRouter);
router.use("/api/v1/actions", ActionRouter);
router.use("/api/v1/analysis", AnalysisRouter);
router.use("/api/v1/previews", PreviewRouter);
router.use("/api/v1/authority_files", AuthorityFileRouter);

// debug
router.use("/test", TestRouter);

export default router;
