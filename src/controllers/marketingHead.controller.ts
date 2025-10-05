import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { MarketingHead } from "../models/marketingHead.model";
import { IMarketingHead } from "../type/marketingHead";
import mongoose from "mongoose";
import { Percentage } from "../models/percentage.model";
import EditRequest from "../models/editRequest.model";
import { IUser } from "../type/user";
import CustomRequest from "../type/customRequest";
import { IEditRequest } from "../type/editRequest";

export const createMarketingHead = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { name, email, gender, age, phone, address, status, percentageId } = body;
    let fields = ["name", "email", "gender", "age", "phone", "address", "status", "percentageId"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(percentageId)) {
        return ReE(res, { message: "Invalid percentage id" }, httpStatus.BAD_REQUEST);
    }
    let checkPer;
    [err, checkPer] = await toAwait(Percentage.findOne({ _id: percentageId }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkPer) return ReE(res, { message: "Percentage is not found for given id" }, httpStatus.NOT_FOUND)
    if (gender) {
        gender = gender.toLowerCase();
        let genderList = ["male", "female", "other"];
        if (!genderList.includes(gender)) {
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

export const updateMarketingHead = async (req: CustomRequest, res: Response) => {
    const body = req.body, user = req.user as IUser;
    if(!user) return ReE(res, { message: "authentication not added in this api please contact admin" }, httpStatus.NOT_FOUND);
    let { _id, name, email, gender, age, phone, address, status, percentageId } = body;
    let err: any;
    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid marketing_head _id!` }, httpStatus.BAD_REQUEST);
    }
    let fields = ["name", "email", "gender", "age", "phone", "address", "status", "percentageId"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (percentageId) {
        if (!mongoose.isValidObjectId(percentageId)) {
            return ReE(res, { message: "Invalid percentage id" }, httpStatus.BAD_REQUEST);
        }
        let checkPer;
        [err, checkPer] = await toAwait(Percentage.findOne({ _id: percentageId }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkPer) return ReE(res, { message: "Percentage is not found for given id" }, httpStatus.NOT_FOUND)
    }
    if (gender) {
        gender = gender.toLowerCase();
        let genderList = ["male", "female", "other"];
        if (!genderList.includes(gender)) {
            return ReE(res, { message: `Invalid gender valid values are (${genderList})!.` }, httpStatus.BAD_REQUEST);
        }
    }

    let getMarketing_head;
    [err, getMarketing_head] = await toAwait(MarketingHead.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMarketing_head) {
        return ReE(res, { message: `marketing_head not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    getMarketing_head = getMarketing_head as IMarketingHead;

    const updateFields: Record<string, any> = {};
    for (const key of fields) {
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

    if (updateFields.percentageId) {
        if (!mongoose.isValidObjectId(percentageId)) {
            return ReE(res, { message: "Invalid percentage id" }, httpStatus.BAD_REQUEST);
        }
        let checkPer;
        [err, checkPer] = await toAwait(Percentage.findOne({ _id: percentageId }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkPer) return ReE(res, { message: "Percentage is not found for given id" }, httpStatus.NOT_FOUND)
    }

    if (user.isAdmin === false) {
        const changes: { field: string; oldValue: any; newValue: any }[] = [];
        fields.forEach((key: any) => {
            const newValue = body[key];
            const oldValue = (getMarketing_head as any)[key];
            if (isNull(newValue)) return
            if (newValue.toString() !== oldValue.toString()) {
                changes.push({ field: key, oldValue, newValue });
            }
        });

        if (changes.length === 0) {
            return ReE(res, { message: "No changes found to update." }, httpStatus.BAD_REQUEST);
        }

        let checkEditRequest;
        [err, checkEditRequest] = await toAwait(
            EditRequest.findOne({ targetId: _id, editedBy: user._id })
        )

        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkEditRequest) {
            checkEditRequest = checkEditRequest as IEditRequest;
            let get = []
            checkEditRequest.changes.forEach((change) => {
                if (changes.some((c) => c.field.toString() === change.field.toString())) {
                    get.push(change)
                }
            })
            if (checkEditRequest.changes.length === get.length && checkEditRequest.status === "pending") {
                return ReE(res, { message: "You already have a pending edit request for this marketDetail." }, httpStatus.BAD_REQUEST);
            }
        }

        let createReq;
        [err, createReq] = await toAwait(
            EditRequest.create({
                targetModel: "MarketingHead",
                targetId: _id,
                editedBy: user._id,
                changes,
                status: "pending",
            })
        );

        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

        return ReS(res, { message: "Edit request created successfully, Awaiting for approval." }, httpStatus.OK);

    } else {

        const [updateErr, updateResult] = await toAwait(
            MarketingHead.updateOne({ _id }, { $set: updateFields })
        );
        if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
        return ReS(res, { message: "Marketing_head updated successfully." }, httpStatus.OK);

    }
};

export const getByIdMarketingHead = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid marketing_head id!` }, httpStatus.BAD_REQUEST);
    }

    let getMarketing_head;
    [err, getMarketing_head] = await toAwait(MarketingHead.findOne({ _id: id }).populate("percentageId"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMarketing_head) {
        return ReE(res, { message: `marketing_head not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "marketing_head found", data: getMarketing_head }, httpStatus.OK)
}

export const getAllMarketingHead = async (req: Request, res: Response) => {
    let err, getMarketing_head;
    [err, getMarketing_head] = await toAwait(MarketingHead.find().populate("percentageId"));

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