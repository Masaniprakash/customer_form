import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { MarketingHead } from "../models/marketing_head.model";
import { IMarketingHead } from "../type/marketing_head";
import mongoose from "mongoose";

export const createMarketingHead = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { name, email, gender, age, phone, address, status } = body;
    let fields = ["name", "email", "gender", "age", "phone", "address", "status"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if(gender){
        gender = gender.toLowerCase();
        let genderList = ["male", "female", "other"];
        if(!genderList.includes(gender)){
            return ReE(res, { message: `Invalid gender valid values are (${genderList})!.` }, httpStatus.BAD_REQUEST);   
        }
    }
    if (email) {
        email = email.trim().toLowerCase();
        let findEmail;
        [err, findEmail] = await toAwait(MarketingHead.findOne({ email: email }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findEmail) {
            return ReE(res, { message: `Email already exists!.` }, httpStatus.BAD_REQUEST);
        }
    }
    if (phone) {
        if (!isPhone(phone)) {
            return ReE(res, { message: `Invalid phone number!.` }, httpStatus.BAD_REQUEST)
        }
        let findPhone;
        [err, findPhone] = await toAwait(MarketingHead.findOne({ phone: phone }))
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findPhone) {
            return ReE(res, { message: `Phone already exists!.` }, httpStatus.BAD_REQUEST)
        }
    }
    let findExist;
    [err, findExist] = await toAwait(MarketingHead.findOne(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (findExist) {
        return ReE(res, { message: `Project already exist for given all data` }, httpStatus.BAD_REQUEST);
    }
    let marketing_head;
    [err, marketing_head] = await toAwait(MarketingHead.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!marketing_head) {
        return ReE(res, { message: `Failed to create marketing_head!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `marketing_head added successfull` }, httpStatus.CREATED);
};

export const updateMarketingHead = async (req: Request, res: Response) => {
    const body = req.body;
    let { _id, name, email, gender, age, phone, address, status } = body;
    let err: any;
    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid marketing_head _id!` }, httpStatus.BAD_REQUEST);
    }
    let fields = ["name", "email", "gender", "age", "phone", "address", "status"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length !== 0) {
        return ReE(res, { message: `Please enter any field to update ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if(gender){
        gender = gender.toLowerCase();
        let genderList = ["male", "female", "other"];
        if(!genderList.includes(gender)){
            return ReE(res, { message: `Invalid gender valid values are (${genderList})!.` }, httpStatus.BAD_REQUEST);   
        }
    }

    let getMarketing_head;
    [err, getMarketing_head] = await toAwait(MarketingHead.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMarketing_head) {
        return ReE(res, { message: `marketing_head not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    const allowedFields = [
        "name",
        "email",
        "gender",
        "age",
        "phone",
        "address",
        "status"
    ];

    const updateFields: Record<string, any> = {};
    for (const key of allowedFields) {
        if (!isNull(body[key])) {
            updateFields[key] = body[key];
        }
    }

    if (updateFields.email) {
        updateFields.email = updateFields.email.trim().toLowerCase();
        let findEmail;
        [err, findEmail] = await toAwait(MarketingHead.findOne({ email: updateFields.email, _id: { $ne: _id } }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findEmail) {
            return ReE(res, { message: `Email already exists!.` }, httpStatus.BAD_REQUEST);
        }
    }
    if (updateFields.phone) {
        if (!isPhone(updateFields.phone)) {
            return ReE(res, { message: `Invalid phone number!.` }, httpStatus.BAD_REQUEST)
        }
        let findPhone;
        [err, findPhone] = await toAwait(MarketingHead.findOne({ phone: updateFields.phone, _id: { $ne: _id } }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (findPhone) {
            return ReE(res, { message: `Phone already exists!.` }, httpStatus.BAD_REQUEST)
        }
    }

    const [updateErr, updateResult] = await toAwait(
        MarketingHead.updateOne({ _id }, { $set: updateFields })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
    return ReS(res, { message: "Marketing_head updated successfully." }, httpStatus.OK);
};

export const getByIdMarketingHead = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid marketing_head id!` }, httpStatus.BAD_REQUEST);
    }

    let getMarketing_head;
    [err, getMarketing_head] = await toAwait(MarketingHead.findOne({ _id: id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMarketing_head) {
        return ReE(res, { message: `marketing_head not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "marketing_head found", data: getMarketing_head }, httpStatus.OK)
}

export const getAllMarketingHead = async (req: Request, res: Response) => {
    let err, getMarketing_head;
    [err, getMarketing_head] = await toAwait(MarketingHead.find());

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getMarketing_head = getMarketing_head as IMarketingHead[]
    if (getMarketing_head.length === 0) {
        return ReE(res, { message: `marketing_head not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "marketing_head found", data: getMarketing_head }, httpStatus.OK)
}

export const deleteMarketingHead = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Marketing_head _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid marketing_head id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(MarketingHead.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `marketing_head not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(MarketingHead.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "marketing_head deleted" }, httpStatus.OK)

}