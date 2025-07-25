import { Request, Response } from "express";
import { isEmpty, isNull, isPhone, isValidDate, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Nvt } from "../models/nvt.model";
import { INVT } from "../type/nvt";
import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { IMOD } from "../type/mod";
import { Mod } from "../models/mod.model";

export const createNvt = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { mod, nvt } = body
    if (!nvt) {
        return ReE(res, "nvt is required", httpStatus.BAD_REQUEST);
    }
    let { needMod, conversion, initialPayment, totalPayment, emi, introducerName, customer } = nvt;
    let fields = ["needMod", "conversion", "initialPayment", "totalPayment", "emi", "introducerName", "customer"];
    let inVaildFields = fields.filter(x => isNull(nvt[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (typeof needMod !== 'boolean') {
        return ReE(res, "needMod must be boolean", httpStatus.BAD_REQUEST);
    }
    if (!customer) {
        return ReE(res, { message: `Please enter customer id!.` }, httpStatus.BAD_REQUEST)
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
    if (typeof conversion !== 'boolean') {
        return ReE(res, "nvt.conversion must be boolean", httpStatus.BAD_REQUEST);
    }
    let createMod: any;
    if (needMod === true) {
        if (!mod) {
            return ReE(res, "mod is required", httpStatus.BAD_REQUEST);
        }
        let { date, siteName, plotNo, introducerPhone, directorName, directorPhone, EDName, EDPhone, amount, status } = mod;
        let fields = ["date", "siteName", "plotNo", "introducerPhone", "directorName", "directorPhone", "EDName", "EDPhone", "amount", "status"];
        let inVaildFields = fields.filter(x => isNull(mod[x]));
        if (inVaildFields.length > 0) {
            return ReE(res, { message: `Please enter required fields ${inVaildFields}! for mod create.` }, httpStatus.BAD_REQUEST);
        }
        if (!isValidDate(date)) {
            return ReE(res, { message: `Invalid date, valid format is (YYYY-MM-DD)!.` }, httpStatus.BAD_REQUEST);
        }
        [err, createMod] = await toAwait(Mod.create({ ...mod, introducerName }))
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!createMod) {
            return ReE(res, { message: `Failed to create mod!.` }, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    let createnvt;
    let obj = nvt;
    if (needMod) {
        obj = { ...obj, mod: createMod._id }
    }
    [err, createnvt] = await toAwait(Nvt.create(obj));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!createnvt) {
        return ReE(res, { message: `Failed to create nvt!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `nvt added successfull` }, httpStatus.CREATED);
};

export const updateNvt = async (req: Request, res: Response) => {
    const body = req.body;
    let err: any;
    let { mod, nvt } = body
    if (!nvt) {
        return ReE(res, "nvt is required", httpStatus.BAD_REQUEST);
    }
    if (!nvt._id) {
        return ReE(res, "nvt._id is required", httpStatus.BAD_REQUEST);
    }
    let checkNvt;
    [err, checkNvt] = await toAwait(Nvt.findById(nvt._id));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkNvt) {
        return ReE(res, { message: `nvt not found!.` }, httpStatus.NOT_FOUND);
    }
    checkNvt = checkNvt as INVT;
    let { needMod, conversion, initialPayment, totalPayment, emi, introducerName, customer } = nvt;
    let fields = ["needMod", "conversion", "initialPayment", "totalPayment", "emi", "introducerName", "customer"];
    let modFields = ["date", "siteName", "plotNo", "introducerPhone", "directorName", "directorPhone", "EDName", "EDPhone", "amount", "status"];
    let inVaildFields = fields.filter(x => !isNull(nvt[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one fields to update ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    if (needMod) {
        if (typeof needMod !== 'boolean') {
            return ReE(res, "needMod must be boolean", httpStatus.BAD_REQUEST);
        }
    }
    if (customer) {
        if (!customer) {
            return ReE(res, { message: `Please enter customer id!.` }, httpStatus.BAD_REQUEST)
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
    }
    if (conversion) {
        if (typeof conversion !== 'boolean') {
            return ReE(res, "nvt.conversion must be boolean", httpStatus.BAD_REQUEST);
        }
    }
    let createMod: any;
    if (needMod === true || checkNvt.needMod === true) {
        if (needMod === true && checkNvt.needMod !== true) {
            if (!mod) {
                return ReE(res, "mod is required", httpStatus.BAD_REQUEST);
            }
            let { date, siteName, plotNo, introducerPhone, directorName, directorPhone, EDName, EDPhone, amount, status } = mod;
            let inVaildFields = fields.filter(x => isNull(mod[x]));
            if (inVaildFields.length > 0) {
                return ReE(res, { message: `Please enter required fields ${inVaildFields}! for mod create.` }, httpStatus.BAD_REQUEST);
            }
            if (!isValidDate(date)) {
                return ReE(res, { message: `Invalid date, valid format is (YYYY-MM-DD)!.` }, httpStatus.BAD_REQUEST);
            }
            [err, createMod] = await toAwait(Mod.create({ ...mod, introducerName }))
            if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
            if (!createMod) {
                return ReE(res, { message: `Failed to create mod!.` }, httpStatus.INTERNAL_SERVER_ERROR);
            }
        } else if (checkNvt.needMod === true && !isEmpty(mod)) {
            if (!mod._id) {
                return ReE(res, "mod id is required", httpStatus.BAD_REQUEST);
            }
            const updateFields: Record<string, any> = {};
            for (const key of modFields) {
                if (!isNull(mod[key])) {
                    updateFields[key] = mod[key];
                }
            }
            if (!isEmpty(updateFields)) {
                [err, createMod] = await toAwait(Mod.updateOne({ _id: mod._id }, { $set: updateFields }));
                if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
                if (!createMod) {
                    return ReE(res, { message: `Failed to update mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
                }
            }
        }
    }
    let updateFields: Record<string, any> = {};
    for (const key of fields) {
        if (!isNull(nvt[key])) {
            updateFields[key] = nvt[key];
        }
    }
    if (needMod === true) {
        updateFields = { ...updateFields, mod: createMod?._id }
    }
    if (needMod === false && checkNvt.needMod === true) {
        updateFields = { ...updateFields, mod: "" }
        //null out the mod field 

    }
    console.log(updateFields);
    
    if (!isEmpty(updateFields)) {
        [err, createMod] = await toAwait(Mod.updateOne({ _id: nvt._id }, { $set: updateFields }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!createMod) {
            return ReE(res, { message: `Failed to update mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
        }
        //remove mod if needMod is false and checkNvt .needMod is true
        if (needMod === false && checkNvt.needMod === true) {
            let removeMod;
            [err, removeMod] = await toAwait(Mod.deleteOne({ _id: checkNvt.mod }));
            if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
            if (!removeMod) {
                return ReE(res, { message: `Failed to remove mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }
    ReS(res, { message: `nvt updated successfull` }, httpStatus.OK);
};

export const getByIdNvt = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid nvt id!` }, httpStatus.BAD_REQUEST);
    }

    let getNvt;
    [err, getNvt] = await toAwait(Nvt.findOne({ _id: id }).populate("customer"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getNvt) {
        return ReE(res, { message: `nvt not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "nvt found", data: getNvt }, httpStatus.OK)
}

export const getAllNvt = async (req: Request, res: Response) => {
    let err, getNvt;
    [err, getNvt] = await toAwait(Nvt.find().populate("customer"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getNvt = getNvt as INVT[]
    if (getNvt.length === 0) {
        return ReE(res, { message: `nvt not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "nvt found", data: getNvt }, httpStatus.OK)
}

export const deleteNvt = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Nvt _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid nvt id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(Nvt.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `nvt not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(Nvt.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "nvt deleted" }, httpStatus.OK)

}