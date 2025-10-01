import httpStatus from "http-status"
import { ReE, ReS, toAwait } from "../services/util.service"
import { Request, Response } from "express"
import plotBookingFormModel from "../models/plotBookingForm.model";
import { IPlotBookingForm } from "../type/plotBookingForm";
import { toLowerCaseObj } from "./common";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../services/digitalOceanConfig";

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

    if (req.file) {
        try {
            const BUCKET = process.env.DO_SPACES_BUCKET;
            const CDN_URL = process.env.DO_SPACES_CDN;
            if (!BUCKET || !CDN_URL) {
                return ReE(res, { message: "Missing environment variables for Digital Ocean" }, httpStatus.INTERNAL_SERVER_ERROR);
            }
            const files = req.file as Express.Multer.File;
            if (!files) {
                return ReE(res, { message: "please upload at least one files" }, httpStatus.BAD_REQUEST);
            }
            const urls: string[] = [];
            const file = files;
            const fileName = `uploads/${Date.now()}_${file.originalname?.replace(/\s+/g, '')}`;
            await s3.send(
                new PutObjectCommand({
                    Bucket: BUCKET,
                    Key: fileName,
                    Body: file.buffer,
                    ACL: "public-read",
                    ContentType: file.mimetype,
                }));
            let url = `${CDN_URL}/${fileName}`
            body = { ...body, photo: url };
        } catch (error) {
            return ReE(res, error, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

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