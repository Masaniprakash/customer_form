// controllers/lifeSaving.controller.ts
import { Request, Response } from "express";
import LifeSaving from "../models/lifeSaving.model";
import lifeSavingModel from "../models/lifeSaving.model";
import { ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { toLowerCaseObj } from "./common";

export const createLifeSaving = async (req: Request, res: Response) => {
    let payload = toLowerCaseObj(req.body),err;
    
    let checkAlready;
    [err, checkAlready] = await toAwait(lifeSavingModel.findOne(payload));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (checkAlready) {
        return ReE(res, { message: `This LifeSaving already exists.` }, httpStatus.BAD_REQUEST);
    }

    let cretaeLSS;
    [err,cretaeLSS] = await toAwait(lifeSavingModel.create(payload));    
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    ReS(res, { message: "LifeSaving created"}, httpStatus.OK);
};

export const getAllLifeSaving = async (req: Request, res: Response) => {

    let err, getAll;
    [err, getAll] = await toAwait(lifeSavingModel.find());
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    ReS(res, { message: "LifeSaving fetched", data: getAll }, httpStatus.OK);

};
