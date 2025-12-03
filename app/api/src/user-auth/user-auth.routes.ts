import { Router } from "express";
import { register, login, getUser } from "./user-auth.controller";
import { authMiddleware } from "./user-auth.utils";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", authMiddleware, getUser);

export default router;
