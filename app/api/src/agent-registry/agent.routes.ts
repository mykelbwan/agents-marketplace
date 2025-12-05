import { Router } from "express";
import multer from "multer";
import path from "path";
import { registerAgent } from "./agent.controller";
import { authMiddleware } from "../user-auth/user-auth.utils";

const router: Router = Router();
const upload = multer({
  dest: path.join(process.cwd(), "tmp"),

  fileFilter: (_req, file, cb) => {
    if (!file.originalname.endsWith(".js")) {
      return cb(new Error("Only JS files are allowed"));
    }
    cb(null, true);
  },

  limits: { fileSize: 1024 * 1024 }, // 1MB
});

// frontend must send the file field as "code" in the form-data
router.post(
  "/register-agent",
  authMiddleware,
  upload.single("code"),
  registerAgent
);

export default router;
