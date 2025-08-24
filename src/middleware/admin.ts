import { Response, Request, NextFunction } from "express";
import { ReE } from "../services/util.service";
import httpStatus from "http-status";

interface CustomRequest extends Request {
  user?: any; // Define the user type based on your JWT payload  
}

const isAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return ReE(res, { error: "verify the token" }, httpStatus.FORBIDDEN);
  }
  if (!req.user.isAdmin) {
    return ReE(res, { error: "Your are not rights do this operation" }, httpStatus.FORBIDDEN);
  }
  next();
}

export default isAdmin;