import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { MarketDetail } from "../models/marketDetail.model";
import { IMarketDetail } from "../type/marketDetail";
import mongoose from "mongoose";
import { MarketingHead } from "../models/marketingHead.model";

export const createMarketDetail = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { headBy, phone, address, status } = body;
    let fields = ["headBy", "phone", "address", "status"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (phone) {
        if (!isPhone(phone)) {
            return ReE(res, { message: `Invalid phone number!.` }, httpStatus.BAD_REQUEST)
        }
        let findPhone;
        [err, findPhone] = await toAwait(MarketDetail.findOne({ phone: phone }))
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findPhone) {
            return ReE(res, { message: `Phone already exists!.` }, httpStatus.BAD_REQUEST)
        }
    }
    if (!mongoose.isValidObjectId(headBy)) {
        return ReE(res, { message: 'Invalid headBy id!' }, httpStatus.BAD_REQUEST);
    }
    let findExist;
    [err, findExist] = await toAwait(MarketingHead.findById({ _id: headBy }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!findExist) {
        return ReE(res, { message: `Marketing head is not found given id: ${headBy}!.` }, httpStatus.NOT_FOUND);
    }
    let marketDetail;
    [err, marketDetail] = await toAwait(MarketDetail.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!marketDetail) {
        return ReE(res, { message: `Failed to create marketDetail!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `marketDetail added successfull` }, httpStatus.CREATED);
};

export const updateMarketDetail = async (req: Request, res: Response) => {
    const body = req.body;
    let err: any;
    let { _id, headBy, phone, address, status } = body;
    let fields = ["headBy", "phone", "address", "status"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }

    let getMarketDetail;
    [err, getMarketDetail] = await toAwait(MarketDetail.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMarketDetail) {
        return ReE(res, { message: `marketDetail not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    const updateFields: Record<string, any> = {};
    for (const key of fields) {
        if (!isNull(body[key])) {
            updateFields[key] = body[key];
        }
    }

    if (headBy) {
        if (!mongoose.isValidObjectId(headBy)) {
            return ReE(res, { message: 'Invalid headBy id!' }, httpStatus.BAD_REQUEST);
        }
        let findExist;
        [err, findExist] = await toAwait(MarketingHead.findById(headBy));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!findExist) {
            return ReE(res, { message: `Marketing head is not found given id: ${headBy}!.` }, httpStatus.NOT_FOUND);
        }
    }

    if (updateFields.phone) {
        if (!isPhone(updateFields.phone)) {
            return ReE(res, { message: `Invalid phone number!.` }, httpStatus.BAD_REQUEST)
        }
        let findPhone;
        [err, findPhone] = await toAwait(MarketDetail.findOne({ phone: updateFields.phone, _id: { $ne: _id } }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findPhone) {
            return ReE(res, { message: `Phone already exists!.` }, httpStatus.BAD_REQUEST)
        }
    }

    const [updateErr, updateResult] = await toAwait(
        MarketDetail.updateOne({ _id }, { $set: updateFields })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
    return ReS(res, { message: "MarketDetail updated successfully." }, httpStatus.OK);
};

export const getByIdMarketDetail = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid marketDetail id!` }, httpStatus.BAD_REQUEST);
    }

    let getMarketDetail;
    [err, getMarketDetail] = await toAwait(MarketDetail.findOne({ _id: id }).populate("headBy"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMarketDetail) {
        return ReE(res, { message: `marketDetail not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "marketDetail found", data: getMarketDetail }, httpStatus.OK)
}

export const getAllMarketDetail = async (req: Request, res: Response) => {
    let err, getMarketDetail;
    [err, getMarketDetail] = await toAwait(MarketDetail.find().populate("headBy"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getMarketDetail = getMarketDetail as IMarketDetail[]
    if (getMarketDetail.length === 0) {
        return ReE(res, { message: `marketDetail not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "marketDetail found", data: getMarketDetail }, httpStatus.OK)
}

export const deleteMarketDetail = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `MarketDetail _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid marketDetail id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(MarketDetail.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `marketDetail not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(MarketDetail.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "marketDetail deleted" }, httpStatus.OK)

}