import { Request, Response } from "express";
import { createUser, username, findUser } from "./user-auth.service";
import { signToken } from "./user-auth.utils";

export const connect = async (req: Request, res: Response) => {
  try {
    const  address  = req.body.address;

    if (!address) {
      return res.status(400).json({ error: "wallet address required" });
    }

    let user = await findUser(address);
    if (!user) {
      user = await createUser(address, username());
    }
    const token = signToken({ id: user.id, address: user.address });

    res.json({
      success: true,
      user,
      token,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
};

export const getUser = async (req: any, res: Response) => {
  // `req.user` comes from authMiddleware
  res.json({ user: req.user });
};
