import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { tUserAccount } from "./user";
import { getUserWithId } from "../models/user.model";

export const hashPassword = async (raw_password: string): Promise<string> => {
  const saltRounds = 8;
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
    req.headers &&
    req.headers.authorization &&
    (req.headers.authorization as string).split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      (req.headers.authorization as string).split(" ")[1],
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
