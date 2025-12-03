import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        address: string;
      };
    }
  }
}

// import { Request } from "express";

// declare module "express-serve-static-core" {
//   interface Request {
//     user?: {
//       address: string;
//       // any other properties you attach to req.user
//     };
//   }
// }
