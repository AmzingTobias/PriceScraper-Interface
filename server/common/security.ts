import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { tUserAccount } from "./user";
import { getUserWithId, isUserAdmin } from "../models/user.models";

export const hashPassword = async (raw_password: string): Promise<string> => {
  const saltRounds = Number(process.env.PASSWORD_SALT_ROUNDS);
  const hashed_password = await bcrypt.hash(raw_password, saltRounds);
  return hashed_password;
};

export const compare_hashed_password = async (
  raw_password: string,
  hashed_password: string
): Promise<boolean> => {
  return await bcrypt.compare(raw_password, hashed_password);
};

export const verify_token = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.cookies["auth-token"] &&
    req.cookies["auth-token"] &&
    (req.cookies["auth-token"] as string).split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      (req.cookies["auth-token"] as string).split(" ")[1],
      process.env.API_SECRET as string,
      async function (err, decode) {
        if (err) {
          req.user = undefined;
          return res.status(401).send("Invalid token");
        }
        // Lookup user
        req.user = await getUserWithId((decode as tUserAccount).Id);
        next();
      }
    );
  } else {
    req.user = undefined;
    return res.status(401).send("No token provided");
  }
};

export const verify_token_is_admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user !== undefined) {
    const isAdmin = await isUserAdmin(req.user.Id);
    if (isAdmin) {
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  } else {
    res.status(401).send("Unauthorized");
  }
};
