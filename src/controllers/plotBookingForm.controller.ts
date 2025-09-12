import httpStatus from "http-status"
import { ReE, ReS, toAwait } from "../services/util.service"
import { Request, Response } from "express"
import plotBookingFormModel from "../models/plotBookingForm.model";
import { IPlotBookingForm } from "../type/plotBookingForm";
import { toLowerCaseObj } from "./common";

export const createPlotBookingForm = async (req: Request, res: Response) => {
    let err;
    let body = toLowerCaseObj(req.body);

    // 🔍 check for duplicate with all provided fields
    let checkAlready;
    [err, checkAlready] = await toAwait(plotBookingFormModel.findOne(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (checkAlready) {
        return ReE(res, { message: `This plotBookingForm already exists.` }, httpStatus.BAD_REQUEST);
    }

    // create new record
    let plotBookingForm;
    [err, plotBookingForm] = await toAwait(plotBookingFormModel.create(body));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!plotBookingForm) {
        return ReE(res, { message: `Failed to create plotBookingForm!` }, httpStatus.INTERNAL_SERVER_ERROR);
    }

    return ReS(res, { message: "plotBookingForm created successfully", data: plotBookingForm }, httpStatus.OK);
};


export const getAllPlotBookingForms = async (req: Request, res: Response) => {
    
    let err;

    let plotBookingForm;
    [err, plotBookingForm] = await toAwait(plotBookingFormModel.find());
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    plotBookingForm = plotBookingForm as IPlotBookingForm[]
    if (plotBookingForm.length == 0) {
        return ReE(res, { message: `No plotBookingForm found!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }

    return ReS(res, { message: "plotBookingForm fetched", data: plotBookingForm }, httpStatus.OK)

}