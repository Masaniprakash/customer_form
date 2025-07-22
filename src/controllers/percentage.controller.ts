import { Request, Response } from "express";
import { isNull, isPhone , ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Percentage } from "../models/percentage.model";
import { IPercentage } from "../type/percentage";
import mongoose from "mongoose";
import { MarketingHead } from "../models/marketingHead.model";

export const createPercentage = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { name, rate } = body;
    let fields = ["name", "rate"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (name) {
        name = name.trim().toLowerCase();
        let findPhone;
        [err, findPhone] = await toAwait(Percentage.findOne({ name }))
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findPhone) {
            return ReE(res, { message: `percentage name already exists!.` }, httpStatus.BAD_REQUEST)
        }
    }
    let percentage;
    [err, percentage] = await toAwait(Percentage.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!percentage) {
        return ReE(res, { message: `Failed to create percentage!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `percentage added successfull` }, httpStatus.CREATED);
};

export const updatePercentage = async (req: Request, res: Response) => {
    const body = req.body;
    let err: any;
    let { _id, name, rate } = body;
    let fields = ["name", "rate"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }

    let getPercentage;
    [err, getPercentage] = await toAwait(Percentage.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getPercentage) {
        return ReE(res, { message: `percentage not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    const updateFields: Record<string, any> = {};
    for (const key of fields) {
        if (!isNull(body[key])) {
            updateFields[key] = body[key];
        }
    }

    if (updateFields.name) {
        updateFields.name = updateFields.name.trim().toLowerCase();
        let findPhone;
        [err, findPhone] = await toAwait(Percentage.findOne({ name, _id: { $ne: _id } }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findPhone) {
            return ReE(res, { message: `Name already exists!.` }, httpStatus.BAD_REQUEST)
        }
    }

    const [updateErr, updateResult] = await toAwait(
        Percentage.updateOne({ _id }, { $set: updateFields })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
    return ReS(res, { message: "Percentage updated successfully." }, httpStatus.OK);
};

export const getByIdPercentage = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid percentage id!` }, httpStatus.BAD_REQUEST);
    }

    let getPercentage;
    [err, getPercentage] = await toAwait(Percentage.findOne({ _id: id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getPercentage) {
        return ReE(res, { message: `percentage not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "percentage found", data: getPercentage }, httpStatus.OK)
}

export const getAllPercentage = async (req: Request, res: Response) => {
    let err, getPercentage;
    [err, getPercentage] = await toAwait(Percentage.find());

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getPercentage = getPercentage as IPercentage[]
    if (getPercentage.length === 0) {
        return ReE(res, { message: `percentage not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "percentage found", data: getPercentage }, httpStatus.OK)
}

export const deletePercentage = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Percentage _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid percentage id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(Percentage.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `percentage not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(Percentage.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "percentage deleted" }, httpStatus.OK)

}