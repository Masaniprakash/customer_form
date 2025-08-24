import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ReE, toAwait } from "../services/util.service";
import { User } from "../models/user.model";
import mongoose from "mongoose";
import CustomRequest from "../type/customRequest";
import { IUser } from "../type/user";
import httpStatus from "http-status";

interface JwtPayload {
    userId: mongoose.Types.ObjectId;
}

export default async function verifyToken(req: CustomRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    const secretKey = process.env.JWT_SECRET as string;
    if (!secretKey) {
        return ReE(res, { message: "Missing JWT_SECRET environment variables" }, httpStatus.INTERNAL_SERVER_ERROR);
    }
    jwt.verify(token, secretKey, async (err: any, verfied) => {
        if (err) {
            return res.status(403).send({ success: false, error: err.message });
        }
        let getUser, error: any;
        let typeJWT = verfied as JwtPayload
        if (!mongoose.isValidObjectId(typeJWT.userId)) {
            return res.status(400).json({ success: false, error: 'token inside user id is not valid' });
        }
        [error, getUser] = await toAwait(User.findById({ _id: typeJWT.userId }).select("-password"))
        if (error) return res.status(400).json({ success: false, error: error.message });
        if (!getUser) return res.status(401).json({ success: false, error: 'provide token User not found' });
        getUser = getUser as IUser;
        req.user = getUser;
        next();
    })
}