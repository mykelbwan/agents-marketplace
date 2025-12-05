import { JwtPayload } from "../user-auth/user-auth.utils";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
