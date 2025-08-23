import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Role } from "../models/role.model";
import { IRole } from "../type/role";
import mongoose from "mongoose";

export const createRole = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { name, status = "active" } = body;
    let fields = ["name"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    name = name.toLowerCase().trim();
    let checkRole;
    [err, checkRole] = await toAwait(Role.findOne({ name }))
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (checkRole) return ReE(res, { message: "Role already exist for given name" }, httpStatus.BAD_REQUEST);
    if (status) {
        let validValue = ["active", "inactive"]
        status = status.toLowerCase().trim();
        if (!validValue.includes(status)) {
            return ReE(res, { message: `status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
        }
    }
    let role;
    [err, role] = await toAwait(Role.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!role) {
        return ReE(res, { message: `Failed to create role!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `role added successfull` }, httpStatus.CREATED);
};

export const updateRole = async (req: Request, res: Response) => {
    const body = req.body;
    const { _id } = body;
    let err: any;

    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }

    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid role _id!` }, httpStatus.BAD_REQUEST);
    }

    let fields = ["name", "status"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }

    let getRole;
    [err, getRole] = await toAwait(Role.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getRole) {
        return ReE(res, { message: `role not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    const updateFields: Record<string, any> = {};
    for (const key of fields) {
        if (!isNull(body[key])) {
            updateFields[key] = body[key];
        }
    }


    if (updateFields.status) {
        let validValue = ["active", "inactive"]
        updateFields.status = updateFields.status.toLowerCase().trim();
        if (!validValue.includes(updateFields.status)) {
            return ReE(res, { message: `status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
        }
    }

    if (updateFields.name) {
        updateFields.name = updateFields.name.toLowerCase().trim();
        let checkRole;
        [err, checkRole] = await toAwait(Role.findOne({ name: updateFields.name, _id:{$ne:_id} }))
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkRole) return ReE(res, { message: "Role already exist for given name" }, httpStatus.BAD_REQUEST);
    }

    const [updateErr, updateResult] = await toAwait(
        Role.updateOne({ _id }, { $set: updateFields })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
    if (!updateResult) {
        return ReE(res, { message: `Failed to update role!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    return ReS(res, { message: "Role updated successfully." }, httpStatus.OK);
};

export const getByIdRole = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid role id!` }, httpStatus.BAD_REQUEST);
    }

    let getRole;
    [err, getRole] = await toAwait(Role.findOne({ _id: id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getRole) {
        return ReE(res, { message: `role not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "role found", data: getRole }, httpStatus.OK)
}

export const getAllRole = async (req: Request, res: Response) => {
    let err, getRole, query = req.query, option: any = {};
    if (query) {
        let { status } = query
        status = status as string;
        if (status) {
            let validValue = ["active", "inactive"]
            status = status.toLowerCase().trim();
            if (!validValue.includes(status)) {
                return ReE(res, { message: `status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            option.status = status
        }
    }
    [err, getRole] = await toAwait(Role.find(option));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getRole = getRole as IRole[]
    if (getRole.length === 0) {
        return ReE(res, { message: `role not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "role found", data: getRole }, httpStatus.OK)
}


export const deleteRole = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Role _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid role id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(Role.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `role not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(Role.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "role deleted" }, httpStatus.OK)

}