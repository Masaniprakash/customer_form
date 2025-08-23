import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Menu } from "../models/menu.model";
import { IMenu } from "../type/menu";
import mongoose from "mongoose";

export const createMenu = async (req: Request, res: Response) => {
    let body = req.body, err;
    let { name, status = "active" } = body;
    let fields = ["name"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }
    name = name.toLowerCase().trim();
    let checkMenu;
    [err, checkMenu] = await toAwait(Menu.findOne({ name }))
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (checkMenu) return ReE(res, { message: "Menu already exist for given name" }, httpStatus.BAD_REQUEST);
    if (status) {
        let validValue = ["active", "inactive"]
        status = status.toLowerCase().trim();
        if (!validValue.includes(status)) {
            return ReE(res, { message: `status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
        }
    }
    let menu;
    [err, menu] = await toAwait(Menu.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!menu) {
        return ReE(res, { message: `Failed to create menu!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    ReS(res, { message: `menu added successfull` }, httpStatus.CREATED);
};

export const updateMenu = async (req: Request, res: Response) => {
    const body = req.body;
    const { _id } = body;
    let err: any;

    if (!_id) {
        return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
    }

    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid menu _id!` }, httpStatus.BAD_REQUEST);
    }

    let fields = ["name", "status"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }

    let getMenu;
    [err, getMenu] = await toAwait(Menu.findOne({ _id: _id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMenu) {
        return ReE(res, { message: `menu not found for given id!.` }, httpStatus.NOT_FOUND)
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
        let checkMenu;
        [err, checkMenu] = await toAwait(Menu.findOne({ name: updateFields.name, _id: { $ne: _id } }))
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkMenu) return ReE(res, { message: "Menu already exist for given name" }, httpStatus.BAD_REQUEST);
    }

    const [updateErr, updateResult] = await toAwait(
        Menu.updateOne({ _id }, { $set: updateFields })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
    if (!updateResult) {
        return ReE(res, { message: `Failed to update menu!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
    return ReS(res, { message: "Menu updated successfully." }, httpStatus.OK);
};

export const getByIdMenu = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid menu id!` }, httpStatus.BAD_REQUEST);
    }

    let getMenu;
    [err, getMenu] = await toAwait(Menu.findOne({ _id: id }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getMenu) {
        return ReE(res, { message: `menu not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "menu found", data: getMenu }, httpStatus.OK)
}

export const getAllMenu = async (req: Request, res: Response) => {
    let err, getMenu, query = req.query, option: any = {};
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
    [err, getMenu] = await toAwait(Menu.find(option));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getMenu = getMenu as IMenu[]
    if (getMenu.length === 0) {
        return ReE(res, { message: `menu not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "menu found", data: getMenu }, httpStatus.OK)
}


export const deleteMenu = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Menu _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid menu id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(Menu.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `menu not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(Menu.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "menu deleted" }, httpStatus.OK)

}