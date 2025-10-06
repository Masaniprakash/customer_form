import httpStatus from "http-status"
import { isNull, ReE, ReS, toAwait } from "../services/util.service"
import { Request, Response } from "express"
import CustomRequest from "../type/customRequest"
import { IUser } from "../type/user"
import mongoose from "mongoose"
import EditRequest from "../models/editRequest.model"
import { IEditRequest } from "../type/editRequest"
import { MarketDetail } from "../models/marketDetail.model"
import { MarketingHead } from "../models/marketingHead.model"


export const approvedEditRequest = async (req: CustomRequest, res: Response) => {
    let user = req.user as IUser, err, body = req.body;
    if (!user || user.isAdmin === false) {
        return ReS(res, { message: "you are access this api" }, httpStatus.UNAUTHORIZED)
    }

    let validFields = ["id", "status"];
    let inVaildFields = validFields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
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

    // if (checkEdit.status === "approved" || checkEdit.status === "rejected") {
    //     return ReE(res, { message: `edit request already ${checkEdit.status}!.` }, httpStatus.BAD_REQUEST)
    // }

    if (status === "rejected" && !reason) {
        return ReE(res, { message: `reason is required for rejected!.` }, httpStatus.BAD_REQUEST)
    }

    if (status === "approved") {
        if (reason) {
            reason = null
        }
    }

    let updateEdit;
    [err, updateEdit] = await toAwait(EditRequest.updateOne({ _id: id }, { $set: { status: status, reason: reason, approvedBy: user._id } }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    if (status !== "approved") {
        return ReS(res, { message: "edit request rejected" }, httpStatus.OK)
    }
    const value: Record<string, any> = {};
    checkEdit.changes.forEach((x) => (value[x.field] = x.newValue));

    try {
        const modelName = checkEdit.targetModel;
        const Model = mongoose.models[modelName];

        if (!Model) {
            return ReE(
                res,
                { message: `Model '${modelName}' not found in mongoose models!` },
                httpStatus.BAD_REQUEST
            );
        }

        const [applyErr, updateResult] = await toAwait(
            Model.updateOne({ _id: checkEdit.targetId }, { $set: value })
        );

        if (applyErr) return ReE(res, applyErr, httpStatus.INTERNAL_SERVER_ERROR);
        if (!updateResult) {
            return ReE(
                res,
                { message: `${modelName} not found for the given targetId!` },
                httpStatus.NOT_FOUND
            );
        }

        if(checkEdit.deletedId && checkEdit.deletedTableName){
            const deletedModelName = checkEdit.deletedTableName;
            const deletedModel = mongoose.models[checkEdit.deletedTableName];
            if (!deletedModel) {
                return ReE(
                    res,
                    { message: `Model '${deletedModelName}' not found in mongoose models!` },
                    httpStatus.BAD_REQUEST
                );
            }
            await deletedModel.deleteOne({ _id: checkEdit.deletedId });
        }

        return ReS(res, { message: `Edit request approved successfully` }, httpStatus.OK);
    } catch (ex: any) {
        return ReE(res, ex, httpStatus.INTERNAL_SERVER_ERROR);
    }
}

export const getAllEditRequest = async (req: CustomRequest, res: Response) => {
    let user = req.user as IUser;
    if (!user || user.isAdmin === false) {
        return ReS(res, { message: "you are access this api" }, httpStatus.UNAUTHORIZED)
    }

    let err, getUser, option: any = {};
    let { status } = req.query

    if (status) {
        status = status as string;
        let validValue = ["pending", "approved", "rejected"]
        status = status?.toLowerCase()?.trim();
        if (!validValue.includes(status)) {
            return ReE(res, { message: `status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
        }
        if (status) {
            option.status = status
        }
    }

    [err, getUser] = await toAwait(EditRequest.find(option).populate('approvedBy').populate('editedBy').populate('deletedId'));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getUser = getUser as IEditRequest[]
    if (getUser.length === 0) {
        return ReE(res, { message: `edit request not found!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "edit request found", data: getUser }, httpStatus.OK)

}

export const getByIdEditRequest = async (req: Request, res: Response) => {
    let err, { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: `Invalid edit request id!` }, httpStatus.BAD_REQUEST);
    }

    let getUser;
    [err, getUser] = await toAwait(EditRequest.findOne({ _id: id }).populate('approvedBy').populate('editedBy'));

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getUser) {
        return ReE(res, { message: `edit request not found for given id!.` }, httpStatus.NOT_FOUND)
    }

    ReS(res, { message: "edit request found", data: getUser }, httpStatus.OK)

}