import { Router } from "express";
import multer from "multer";
import path from "path";
import { registerAgent } from "./agent.controller";

const router: Router = Router();
const upload = multer({
  dest: path.join(process.cwd(), "tmp"),
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype !== "application/javascript") {
  //     return cb(new Error("Only JS files are allowed"));
  //   }
  //   cb(null, true);
  // },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.endsWith(".js")) {
      return cb(new Error("Only JS files are allowed"));
    }
    cb(null, true);
  },

 // limits: { fileSize: 1024 * 1024 }, // 1MB
});

// frontend must send the file field as "code" in the form-data
router.post("/register-agent", upload.single("code"), registerAgent);
router.get("/ping", (req, res) => res.send("pong"));

export default router;
