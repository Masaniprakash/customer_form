import httpStatus from "http-status"
import { ReE, ReS, toAwait } from "../services/util.service"
import { Request, Response } from "express"
import CustomRequest from "../type/customRequest"
import { IUser } from "../type/user"
import mongoose from "mongoose"
import EditRequest from "../models/editRequest.model"
import { IEditRequest } from "../type/editRequest"


export const approvedEditRequest = async (req: CustomRequest, res: Response) => {
    let user= req.user as IUser, err, body = req.body;
    if (!user ||user.isAdmin === false) {
        return ReS(res, { message: "you are access this api" }, httpStatus.UNAUTHORIZED)
    }

    let { id, status, reason } = body;
    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid edit request id!` }, httpStatus.BAD_REQUEST);
    }

    let statusValid = ["approved", "rejected"];
    status = status.toLowerCase();
    if (!statusValid.includes(status)) {
        return ReE(res, { message: `Invalid status value, valid value are (${statusValid})!` }, httpStatus.BAD_REQUEST);
    }

    let checkEdit;
    [err, checkEdit] = await toAwait(EditRequest.findOne({ _id: id }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkEdit) {
        return ReE(res, { message: `edit request not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    checkEdit = checkEdit as IEditRequest;

    if(status === "rejected" && !reason){
        return ReE(res, { message: `reason is required for rejected!.` }, httpStatus.BAD_REQUEST)
    }

    if (checkEdit.status === "approved" || checkEdit.status === "rejected") {
        return ReE(res, { message: `edit request already ${checkEdit.status}!.` }, httpStatus.BAD_REQUEST)
    }

    let updateEdit;
    [err, updateEdit] = await toAwait(EditRequest.updateOne({ _id: id }, { $set: { status: status, reason: reason, approvedBy: user._id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    return ReS(res, { message: "edit request approved" }, httpStatus.OK)

}