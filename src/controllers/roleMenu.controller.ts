import { Request, Response } from "express";
import { isNull, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { IRoleMenu } from "../type/roleMenu";
import { IMenu } from "../type/menu";
import { Role } from "../models/role.model";
import { Menu } from "../models/menu.model";
import { RoleMenu } from "../models/roleMenu.model";

export const createRoleMenu = async (req: Request, res: Response) => {

    //   let user = req.user, err, body = req.body;
    let err, body = req.body;

    //   if (!user || !user.isAdmin) {
    //     return ReE(res, { message: "Unauthorized your not do this" }, httpStatus.UNAUTHORIZED);
    //   }

    let { roleId, menuId, read, create, update, delete: roleMenuDelete } = body;

    let fields = ["roleId", "menuId", "read", "update", "delete", "create"]

    let inVaildFields = fields.filter(x => isNull(body[x]));

    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }

    if (!mongoose.isValidObjectId(roleId)) {
        return ReE(res, { message: "Invalid role id" }, httpStatus.BAD_REQUEST);
    }

    if (!mongoose.isValidObjectId(menuId)) {
        return ReE(res, { message: "Invalid menu id" }, httpStatus.BAD_REQUEST);
    }

    if (create || update || roleMenuDelete) {
        if (!read) {
            return ReE(res, { message: `create, update or delete any one is true means read must be true` }, httpStatus.BAD_REQUEST);
        }
    };

    let checkMenu;
    [err, checkMenu] = await toAwait(Menu.findById(menuId));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!checkMenu) {
        return ReE(res, { message: "Menu not found for give menu id" }, httpStatus.NOT_FOUND);
    }

    checkMenu = checkMenu as IMenu;

    let checkRole;
    [err, checkRole] = await toAwait(Role.findById(roleId));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!checkRole) {
        return ReE(res, { message: "Role not found for give role id" }, httpStatus.NOT_FOUND);
    }

    let checkRoleMenu;
    [err, checkRoleMenu] = await toAwait(RoleMenu.findOne({ roleId: roleId, menuId: menuId }))

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (checkRoleMenu) {
        return ReE(res, { message: "Role menu already exist" }, httpStatus.CONFLICT);
    }

    let createRoleMenu;
    [err, createRoleMenu] = await toAwait(RoleMenu.create({
        roleId: roleId,
        menuId: menuId,
        read,
        create,
        update,
        delete: roleMenuDelete,
        status: "active"
    }))

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!createRoleMenu) {
        return ReE(res, { message: "Failed to create role menu" }, httpStatus.INTERNAL_SERVER_ERROR);
    }

    ReS(res, { message: "Role menu created successfully", data: createRoleMenu }, httpStatus.OK)

}

export const updateRoleMenu = async (req: Request, res: Response) => {

    //   let err, body = req.body, user = req.user;
    let err, body = req.body;

    //   if (!user || !user.isAdmin) {
    //     return ReE(res, { message: "Unauthorized your not do this" }, httpStatus.UNAUTHORIZED);
    //   }

    let { _id, read, create, update, delete: roleMenuDelete, menuId, roleId } = body;

    let fields = ["read", "update", "delete", "create", "menuId", "roleId"]

    let inVaildFields = fields.filter(x => !isNull(body[x]));

    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one of fields (${fields}) to update!.` }, httpStatus.BAD_REQUEST);
    }

    if (isNull(_id)) {
        return ReE(res, { message: "Role menu id is required" }, httpStatus.BAD_REQUEST);
    }

    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: "Invalid role menu id" }, httpStatus.BAD_REQUEST);
    }

    //   let option:any={}

    //   if(menuId){
    //     let checkMenu;
    //     [err, checkMenu] = await toAwait(Menu.findById(menuId));

    //     if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    //     if (!checkMenu) {
    //     return ReE(res, { message: "Menu not found for give menu id" }, httpStatus.NOT_FOUND);
    //     }
    //     option.menuId = menuId
    //   }

    //   if(roleId){
    //     let checkRole;
    //     [err, checkRole] = await toAwait(Role.findById(roleId));

    //     if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    //     if (!checkRole) {
    //     return ReE(res, { message: "Role not found for give role id" }, httpStatus.NOT_FOUND);
    //     }
    //     option.roleId = roleId
    //   }

    let checkRoleMenu;
    [err, checkRoleMenu] = await toAwait(RoleMenu.findById(_id));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!checkRoleMenu) {
        return ReE(res, { message: "Role menu not found for give role menu id" }, httpStatus.NOT_FOUND);
    }

    checkRoleMenu = checkRoleMenu as IRoleMenu;

    let option={
        read: read ?? checkRoleMenu.read,
        create: create ?? checkRoleMenu.create,
        update: update ?? checkRoleMenu.update,
        delete: roleMenuDelete ?? checkRoleMenu.delete
    };

    let updateRoleMenu;
    [err, updateRoleMenu] = await toAwait(RoleMenu.findByIdAndUpdate(_id, option, { new: true }));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!updateRoleMenu) {
        return ReE(res, { message: "Failed to update role menu" }, httpStatus.INTERNAL_SERVER_ERROR);
    }

    ReS(res, { message: "Role menu updated successfully" }, httpStatus.OK)

}

export const getAllRoleMenu = async (req: Request, res: Response) => {

    //   let err, user = req.user,optionForGet:any={};
    let err, optionForGet: any = {};

    //   if (!user || !user.isAdmin) {
    //     return ReE(res, { message: "Unauthorized your not do this" }, httpStatus.UNAUTHORIZED);
    //   }

    let { status, limit, page } = req.query;

    if (status){

      let statusValue = ["active", "inactive"]

      if (!statusValue.includes(status.toString().toLowerCase())) {
        return ReE(res, { message: `Invalid status detail, valid type is (${statusValue}) in query` }, httpStatus.BAD_REQUEST);
      }

      optionForGet.status = status.toString().toLowerCase();

    }

    const setPage: number = parseInt(page as string)   // Default page is 1
    const setLimit: number = parseInt(limit as string)   // Default limit is 10

    // Calculating the offset (how many records to skip)
    const setOffset: number = (setPage - 1) * setLimit;


    if (limit && !page) {
        return ReE(res, { message: "limit send in query means page is required or do not send the limit." }, httpStatus.BAD_REQUEST);
    }

    if (page && !limit) {
        return ReE(res, { message: "page send in query means limit is required or do not send the page." }, httpStatus.BAD_REQUEST);
    }

    let totalCount
    [err, totalCount] = await toAwait(RoleMenu.countDocuments(optionForGet));

    if (err) {
        return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    }

    totalCount = totalCount as number;

    if (totalCount === 0) {
        return ReE(res, { message: "Role menu not found in db" }, httpStatus.NOT_FOUND)
    }

    if (limit && page) {

        const totalPages = Math.ceil(totalCount / setLimit);

        if (setPage > totalPages) {
            return ReE(res, { message: `Page no ${page} not available. The last page no is ${totalPages}.` }, httpStatus.NOT_FOUND)
        }

    }

    let roleMenus;
    [err, roleMenus] = await toAwait(RoleMenu.find(optionForGet).populate("roleId menuId").limit(setLimit).skip(setOffset).sort({ createdAt: -1 })
    );

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!roleMenus) {
        return ReE(res, { message: "No role menus found" }, httpStatus.NOT_FOUND);
    }

    ReS(res, { message: "Role menus found successfully", data: roleMenus, count: totalCount }, httpStatus.OK)

}

export const getByIdRoleMenu = async (req: Request, res: Response) => {

    let err;

    // if (!user || !user.isAdmin) {
    //     return ReE(res, { message: "Unauthorized your not do this" }, httpStatus.UNAUTHORIZED);
    // }

    let { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: "Invalid role menu id" }, httpStatus.BAD_REQUEST);
    }

    let roleMenu;
    [err, roleMenu] = await toAwait(RoleMenu.findById(id).populate("roleId menuId"));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (!roleMenu) {
        return ReE(res, { message: "Role menu not found for give role menu id" }, httpStatus.NOT_FOUND);
    }

    ReS(res, { message: "Role menu found successfully", data: roleMenu }, httpStatus.OK)

}

export const deleteRoleMenu = async (req: Request, res: Response) => {
    let err, { _id } = req.body;
    if (!_id) {
        return ReE(res, { message: `Role menu _id is required!` }, httpStatus.BAD_REQUEST);
    }
    if (!mongoose.isValidObjectId(_id)) {
        return ReE(res, { message: `Invalid role menu id!` }, httpStatus.BAD_REQUEST);
    }

    let checkUser;
    [err, checkUser] = await toAwait(RoleMenu.findOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkUser) {
        return ReE(res, { message: `role menu not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    let deleteUser;
    [err, deleteUser] = await toAwait(RoleMenu.deleteOne({ _id: _id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
    ReS(res, { message: "role menu deleted" }, httpStatus.OK)

}