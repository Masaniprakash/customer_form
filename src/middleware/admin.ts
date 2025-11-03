import { Response, Request, NextFunction } from "express";
import { ReE, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Role } from "../models/role.model";

interface CustomRequest extends Request {
  user?: any;
  isCreatedAdmin?: boolean
}

// Main middleware logic
const isAdminMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
  isRequest: boolean = false
) => {
  if (!req.user) {
    return ReE(res, { error: "verify the token" }, httpStatus.FORBIDDEN);
  }

  // EXCEPTIONAL CASE: If this is Request module route
  if (isRequest) {
    // Check if user has a role ID
    if (req.user.role) {
      let err, roleData;
      [err, roleData] = await toAwait(Role.findById(req.user.role));

      if (err) {
        return ReE(
          res,
          { error: "Error verifying role" },
          httpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // If role name is "admin", allow access
      const roleName = (roleData as any)?.name;
      if (
        roleData &&
        typeof roleName === "string" &&
        roleName.toLowerCase().trim() === "admin"
      ) {
        req.isCreatedAdmin = true
        return next();
      }
    }
  }

  // Standard check: super admin (isAdmin = true)
  if (!req.user.isAdmin) {
    return ReE(
      res,
      { error: "You don't have rights to do this operation" },
      httpStatus.FORBIDDEN
    );
  }
  // Super admin - set flag to false
  req.isCreatedAdmin = false;

  next();
};

// Export as both direct middleware AND factory function
const isAdmin: any = (
  req: CustomRequest | boolean,
  res?: Response,
  next?: NextFunction
) => {
  // If first argument is boolean, it's factory mode
  if (typeof req === "boolean") {
    const isRequest = req;
    return (req: CustomRequest, res: Response, next: NextFunction) =>
      isAdminMiddleware(req, res, next, isRequest);
  }

  // Otherwise, it's direct middleware mode (backward compatible)
  return isAdminMiddleware(req as CustomRequest, res!, next!, false);
};

export default isAdmin;
