import { Router } from "express";
import { connect, getUser } from "./user-auth.controller";
import { authMiddleware } from "./user-auth.utils";

const router: Router = Router();

router.post("/connect", connect);
router.get("/user", authMiddleware, getUser);

export default router;
