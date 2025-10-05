import { Request, Response } from "express";
import { isNull, isPhone, isValidDate, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Mod } from "../models/mod.model";
import { IMOD } from "../type/mod";
import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import CustomRequest from "../type/customRequest";
import { IUser } from "../type/user";
import EditRequest from "../models/editRequest.model";
import { IEditRequest } from "../type/editRequest";

export const createMod = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { date, siteName, plotNo, customer, introducerName, introducerPhone, directorName, directorPhone, EDName, EDPhone, amount, status } = body;
    let fields = ["date", "siteName", "plotNo", "customer", "introducerName", "introducerPhone", "directorName", "directorPhone", "EDName", "EDPhone", "amount", "status"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(customer)) {
        return ReE(res, { message: 'Invalid customer id!' }, httpStatus.BAD_REQUEST);
    }
    let findExist;
    [err, findExist] = await toAwait(Customer.findById({ _id: customer }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!findExist) {
        return ReE(res, { message: `customer is not found given id: ${customer}!.` }, httpStatus.NOT_FOUND);
    }
    if (!isValidDate(date)) {
        return ReE(res, { message: `Invalid date, valid format is (YYYY-MM-DD)!.` }, httpStatus.BAD_REQUEST);
    }
    let mod;
    [err, mod] = await toAwait(Mod.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!mod) {
        return ReE(res, { message: `Failed to create mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `mod added successfull` }, httpStatus.CREATED);
};

export const updateMod = async (req: CustomRequest, res: Response) => {
    const body = req.body, user= req.user as IUser;

    if(!user) return ReE(res, { message: "authentication not added in this api please contact admin" }, httpStatus.NOT_FOUND);

    let err: any;
    let { _id, date, siteName, plotNo, customer, introducerName, introducerPhone, directorName, directorPhone, EDName, EDPhone, amount, status } = body;
    let fields = ["date", "siteName", "plotNo", "customer", "introducerName", "introducerPhone", "directorName", "directorPhone", "EDName", "EDPhone", "amount", "status"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }

    let getMod;
    [err, getMod] = await toAwait(Mod.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMod) {
        return ReE(res, { message: `mod not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    const updateFields: Record<string, any> = {};
    for (const key of fields) {
        if (!isNull(body[key])) {
            updateFields[key] = body[key];
        }
    }

    if (updateFields.date) {
        if (!isValidDate(updateFields.date)) {
            return ReE(res, {
                message: `Invalid date, valid format is (YYYY-MM-DD)!.`
            }, httpStatus.BAD_REQUEST);
        }
    }

    if (updateFields.customer) {
        if (!mongoose.isValidObjectId(customer)) {
            return ReE(res, { message: 'Invalid customer id!' }, httpStatus.BAD_REQUEST);
        }
        let findExist;
        [err, findExist] = await toAwait(Customer.findById({ _id: customer }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!findExist) {
            return ReE(res, { message: `customer is not found given id: ${customer}!.` }, httpStatus.NOT_FOUND);
        }
    }

    if (user.isAdmin === false) {
        const changes: { field: string; oldValue: any; newValue: any }[] = [];
        fields.forEach((key: any) => {
            const newValue = body[key];
            const oldValue = (getMod as any)[key];
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
                return ReE(res, { message: "You already have a pending edit request for this mod." }, httpStatus.BAD_REQUEST);
            }
        }

        let createReq;
        [err, createReq] = await toAwait(
            EditRequest.create({
                targetModel: "Mod",
                targetId: _id,
                editedBy: user._id,
                changes,
                status: "pending"
            })
        );

        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

        return ReS(res, { message: "Edit request created successfully, Awaiting for approval." }, httpStatus.OK);

    } else {

        const [updateErr, updateResult] = await toAwait(
            Mod.updateOne({ _id }, { $set: updateFields })
        );
        if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
        return ReS(res, { message: "Mod updated successfully." }, httpStatus.OK);

    }

};

export const getByIdMod = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid mod id!` }, httpStatus.BAD_REQUEST);
    }

    let getMod;
    [err, getMod] = await toAwait(Mod.findOne({ _id: id }).populate("customer"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMod) {
        return ReE(res, { message: `mod not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "mod found", data: getMod }, httpStatus.OK)
}

export const getAllMod = async (req: Request, res: Response) => {
    let err, getMod;
    [err, getMod] = await toAwait(Mod.find().populate("customer"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getMod = getMod as IMOD[]
    if (getMod.length === 0) {
        return ReE(res, { message: `mod not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "mod found", data: getMod }, httpStatus.OK)
}

export const deleteMod = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Mod _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid mod id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(Mod.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `mod not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(Mod.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "mod deleted" }, httpStatus.OK)

}