import { Request, Response } from "express";
import { General } from "../models/general.model";
import { Plot } from "../models/plot.model";
import { Emi } from "../models/emi.model";
import { isNull, isValidDate, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Customer } from "../models/customer.model";
import { Billing } from "../models/billing.model";
import { Flat } from "../models/flat.model";
import mongoose from "mongoose";
import { IGeneral } from "../type/general";
import { IPlot } from "../type/plot";
import { IBilling } from "../type/billing";
import { IFlat } from "../type/flat";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../services/digitalOceanConfig";
import { MarketDetail } from "../models/marketDetail.model";
import { MarketingHead } from "../models/marketingHead.model";
import { IMarketingHead } from "../type/marketingHead";
import { Percentage } from "../models/percentage.model";
import { Marketer } from "../models/marketer";
import { IEmi } from "../type/emi";


export const uploadImages = async (req: Request, res: Response) => {
    try {
        const BUCKET = process.env.DO_SPACES_BUCKET;
        const CDN_URL = process.env.DO_SPACES_CDN;
        if(!BUCKET || !CDN_URL) {
            return ReE(res, { message: "Missing environment variables for Digital Ocean" }, httpStatus.INTERNAL_SERVER_ERROR);
        }
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return ReE(res, { message: "please upload at least one files" }, httpStatus.BAD_REQUEST);
        }
        const urls: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `uploads/${Date.now()}_${file.originalname?.replace(/\s+/g, '')}`;
            await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: fileName,
                Body: file.buffer,
                ACL: "public-read",
                ContentType: file.mimetype,
            }));
            urls.push(`${CDN_URL}/${fileName}`);
        }
        return ReS(res, { message: "files uploaded successfully", data: urls }, httpStatus.OK);
    } catch (error) {
        return ReE(res, error, httpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const createCommonData = async (req: Request, res: Response) => {
    let body = req.body, err;
    const { customerId, general, plot, billing, flat } = body;

    if (!customerId) {
        return ReE(res, { message: "customerId is required" }, httpStatus.BAD_REQUEST);
    }

    if(!mongoose.isValidObjectId(customerId)){
        return ReE(res, { message: "Invalid customerId" }, httpStatus.BAD_REQUEST);
    }

    let checkCustomer;
    [err, checkCustomer] = await toAwait(Customer.findOne({ _id: customerId }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkCustomer) {
        return ReE(res, { message: "customer not found for given id" }, httpStatus.BAD_REQUEST);
    }

    let fields = [ "general", "plot", "billing", "flat" ];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to create ${fields}!.` }, httpStatus.BAD_REQUEST);
    }

    const results: any = {};
    const errors: any[] = [];
    let getMarketerHeadInBill : any;
    let getEmiInBill : any;

    const tryCreate = async (model: any, data: any, key: string) => {
        try {
            results[key] = await model.create({ ...data, customer: customerId });
            return true;
        } catch (err: any) {
            errors.push({ [key]: err.message });
            return false;
        }
    };

    if (general) {
        if(general.status){
            general.status = general.status.toLowerCase();
            let validValue = ["enquired", "blocked", "vacant"]
            if (!validValue.includes(general.status)) {
                return ReE(res, { message: `general status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            general.status = general.status === "enquired" ? "Enquired" : general.status === "blocked" ? "Blocked" : "Vacant";
        }
        if(!general.noOfInstallments){
            return ReE(res, { message: "no of installments is required in general" }, httpStatus.BAD_REQUEST);
        }

        if(isNaN(general.noOfInstallments)){
            return ReE(res, { message: "no of installments must be number in genaral" }, httpStatus.BAD_REQUEST);
        }

        if(!general.emiAmount){
            return ReE(res, { message: "emi amount is required in general" }, httpStatus.BAD_REQUEST);
        }

        if(!general.marketer){
            return ReE(res, { message: "marketer is required in general" }, httpStatus.BAD_REQUEST);
        }

        if(!mongoose.isValidObjectId(general.marketer)){
            return ReE(res, { message: "Invalid marketer id in general" }, httpStatus.BAD_REQUEST);
        }

        let checkIntroducer, err:any;
        [err, checkIntroducer] = await toAwait(MarketingHead.findOne({ _id: general.marketer }));
        if(err){
            return ReE(res, {message:`${err.message} - in marketer in general`}, httpStatus.INTERNAL_SERVER_ERROR);
        }
        if(!checkIntroducer){
            return ReE(res, { message: "marketer id not found in create general" }, httpStatus.BAD_REQUEST);
        }

    }

    if (billing) {

        if (billing.status) {
            billing.status = billing.status.toLowerCase();
            let validValue = ["enquired", "blocked"]
            if (!validValue.includes(billing.status)) {
                return ReE(res, { message: `billing status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.status = billing.status === "enquired" ? "Enquiry" : "Blocked";
        }

        if (billing.modeOfPayment) {
            let validValue = ["cash", 'card', 'online']
            billing.modeOfPayment = billing.modeOfPayment.toLowerCase();
            if (!validValue.includes(billing.modeOfPayment)) {
                return ReE(res, { message: `mode of payment value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.modeOfPayment = billing.modeOfPayment === "cash" ? "Cash" : billing.modeOfPayment === "card" ? "Card" : "Online";
        }

        if (billing.saleType) {
            let validValue = ["plot", "flat", "villa"]
            billing.saleType = billing.saleType.toLowerCase();
            if (!validValue.includes(billing.saleType)) {
                return ReE(res, { message: `sale type value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.saleType = billing.saleType === "plot" ? "Plot" : billing.saleType === "flat" ? "Flat" : "Villa";
        }

        if(!billing.paidDate){
            return ReE(res, { message: "paidDate is required in billing" }, httpStatus.BAD_REQUEST);
        }

        if (!isValidDate(billing.paidDate)) {
            return ReE(res, { message: `Invalid date, valid format is (YYYY-MM-DD)!.` }, httpStatus.BAD_REQUEST);
        }

        billing.paidDate = new Date(billing.paidDate);

        // if (billing.transactionType) {
        //     let validValue = ["emi receipt", "other"]
        //     billing.transactionType = billing.transactionType.toLowerCase();
        //     if (!validValue.includes(billing.transactionType)) {
        //         return ReE(res, { message: `transaction type value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
        //     }
        //     billing.transactionType = billing.transactionType === "emi receipt" ? "EMI Receipt" : "Other";
        // }


        if(!billing.emi){
            return ReE(res, { message: "emi is required when billing is created" }, httpStatus.BAD_REQUEST);
        }
        if(!mongoose.isValidObjectId(billing.emi)){
            return ReE(res, { message: "Invalid emi id in billing" }, httpStatus.BAD_REQUEST);
        }
        let checkEmi, err:any;
        [err, checkEmi] = await toAwait(Emi.findOne({ _id: billing.emi }));
        if(err){
            return ReE(res, {message:`${err.message} - in emi details in billing`}, httpStatus.INTERNAL_SERVER_ERROR);
        }
        if(!checkEmi){
            return ReE(res, { message: "emi id not found in create billing" }, httpStatus.BAD_REQUEST);
        }
        checkEmi= checkEmi as IEmi
        getEmiInBill = checkEmi;

        billing.paidAmt = checkEmi.emiAmt;

        if(!billing.introducer){
            return ReE(res, { message: "introducer is required when billing is created" }, httpStatus.BAD_REQUEST);
        }


        if(!mongoose.isValidObjectId(billing.introducer)){
            return ReE(res, { message: "Invalid introducer id in billing" }, httpStatus.BAD_REQUEST);
        }

        let checkIntroducer;
        [err, checkIntroducer] = await toAwait(MarketingHead.findOne({ _id: billing.introducer }).populate("percentageId"));
        if(err){
            return ReE(res, {message:`${err.message} - in introducer details in billing`}, httpStatus.INTERNAL_SERVER_ERROR);
        }
        if(!checkIntroducer){
            return ReE(res, { message: "introducer id not found in create billing" }, httpStatus.BAD_REQUEST);
        }

        checkIntroducer = checkIntroducer as IMarketingHead;
        getMarketerHeadInBill = checkIntroducer;

    }

    if (general) {
        let checkAlreadyExist = await General.findOne(general);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkAlreadyExist) return ReE(res, { message: `general already exist based on given all details` }, httpStatus.BAD_REQUEST);
        let status = await tryCreate(General, general, "general");

        if(status){
            if(general.noOfInstallments){
                for (let index = 0; index < general.noOfInstallments; index++) {
                    let emi={
                        customer: customerId,
                        emiNo: index + 1,
                        date: new Date(new Date().setMonth(new Date().getMonth() + index)),
                        emiAmt: general.emiAmount
                    }
                    await tryCreate(Emi, emi, "emi");
                }
            }
        }
    }

    if (billing) {
        billing.transactionType = "EMI Receipt"
        let checkAlreadyExist = await Billing.findOne(billing);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkAlreadyExist) return ReE(res, { message: `billing already exist based on given all details` }, httpStatus.BAD_REQUEST);
        let status =await tryCreate(Billing, billing, "billing");
        let percent = Number(getMarketerHeadInBill?.percentageId?.rate?.replace("%", ""));
        
        if(status){
            if(getMarketerHeadInBill?.percentageId?.rate){
                let marketerDe = {
                    customer: customerId,
                    emiNo: getEmiInBill?.emiNo,
                    paidDate: billing.paidDate,
                    paidAmt: billing.paidAmt ,
                    marketer: billing.introducer,
                    commPercentage: percent,
                    commAmount: billing.paidAmt  * (percent / 100),
                    emiId: getEmiInBill?._id
                }
                let s = await tryCreate(Marketer, marketerDe, "marketer");

                if(s){
                    let updateEmi;
                    [err, updateEmi] = await toAwait(Emi.findOneAndUpdate({ _id: getEmiInBill?._id }, { paidDate: billing.paidDate }, { new: true }));
                    if(err){
                        return;
                    }
                }
            }
        }
    }

    if (plot) {
        let checkAlreadyExist = await Plot.findOne(plot);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkAlreadyExist) return ReE(res, { message: `plot already exist based on given all details` }, httpStatus.BAD_REQUEST);
        await tryCreate(Plot, plot, "plot");
    }

    if (flat) {
        let checkAlreadyExist = await Flat.findOne(flat);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkAlreadyExist) return ReE(res, { message: `flat already exist based on given all details` }, httpStatus.BAD_REQUEST);
        if (flat) await tryCreate(Flat, flat, "flat");
    }


    if (errors.length > 0) return ReE(res, { message: errors }, httpStatus.BAD_REQUEST);
    return ReS(res, { message: "success", data: results }, httpStatus.OK);
};

export const UpdateCommonData = async (req: Request, res: Response) => {
    let body = req.body, err: any;
    const { customerId, general, plot, billing, flat } = body;

    if (!customerId) {
        return ReE(res, { message: "customerId is required" }, httpStatus.BAD_REQUEST);
    }

    let checkCustomer;
    [err, checkCustomer] = await toAwait(Customer.findOne({ _id: customerId }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!checkCustomer) {
        return ReE(res, { message: "customer not found for given id" }, httpStatus.BAD_REQUEST);
    }

    let fields = ["general", "plot", "billing", "flat"];
    let inVaildFields = fields.filter(x => !isNull(body[x]));
    if (inVaildFields.length === 0) {
        return ReE(res, { message: `Please enter any one field to update ${fields}!.` }, httpStatus.BAD_REQUEST);
    }

    const results: any = {};
    const errors: any[] = [];

    if (general) {
        if (general.status) {
            general.status = general.status.toLowerCase();
            let validValue = ["enquired", "blocked", "vacant"]
            if (!validValue.includes(general.status)) {
                return ReE(res, { message: `general status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            general.status = general.status === "enquired" ? "Enquired" : general.status === "blocked" ? "Blocked" : "Vacant";
        }

        if (!general._id) {
            return ReE(res, { message: "when update general then general _id is required" }, httpStatus.BAD_REQUEST);
        }

        if (!mongoose.isValidObjectId(general._id)) {
            return ReE(res, { message: "general _id is invalid" }, httpStatus.BAD_REQUEST);
        }


        let checkAlreadyExist = await General.findOne({ _id: general._id });
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkAlreadyExist) return ReE(res, { message: `general not found given id` }, httpStatus.BAD_REQUEST);

    }

    if (billing) {

        if (billing.status) {
            billing.status = billing.status.toLowerCase();
            let validValue = ["enquired", "blocked"]
            if (!validValue.includes(billing.status)) {
                return ReE(res, { message: `billing status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.status = billing.status === "enquired" ? "Enquiry" : "Blocked";
        }

        if (billing.modeOfPayment) {
            let validValue = ["cash", 'card', 'online']
            billing.modeOfPayment = billing.modeOfPayment.toLowerCase();
            if (!validValue.includes(billing.modeOfPayment)) {
                return ReE(res, { message: `mode of payment value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.modeOfPayment = billing.modeOfPayment === "cash" ? "Cash" : billing.modeOfPayment === "card" ? "Card" : "Online";
        }

        if (billing.saleType) {
            let validValue = ["plot", "flat", "villa"]
            billing.saleType = billing.saleType.toLowerCase();
            if (!validValue.includes(billing.saleType)) {
                return ReE(res, { message: `sale type value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.saleType = billing.saleType === "plot" ? "Plot" : billing.saleType === "flat" ? "Flat" : "Villa";
        }

        if (billing.transactionType) {
            let validValue = ["emi receipt", "other"]
            billing.transactionType = billing.transactionType.toLowerCase();
            if (!validValue.includes(billing.transactionType)) {
                return ReE(res, { message: `transaction type value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
            }
            billing.transactionType = billing.transactionType === "emi receipt" ? "EMI Receipt" : "Other";
        }

        if (!billing._id) {
            return ReE(res, { message: "when update billing then billing _id is required" }, httpStatus.BAD_REQUEST);
        }

        if (!mongoose.isValidObjectId(billing._id)) {
            return ReE(res, { message: "billing _id is invalid" }, httpStatus.BAD_REQUEST);
        }

        let checkAlreadyExist = await Billing.findOne(billing);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkAlreadyExist) return ReE(res, { message: `billing not found given id` }, httpStatus.BAD_REQUEST);

    }

    if (flat) {
        if (!flat._id) {
            return ReE(res, { message: "when update flat then flat _id is required" }, httpStatus.BAD_REQUEST);
        }

        if (!mongoose.isValidObjectId(flat._id)) {
            return ReE(res, { message: "flat _id is invalid" }, httpStatus.BAD_REQUEST);
        }

        let checkAlreadyExist = await Flat.findOne({ _id: flat._id });
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkAlreadyExist) return ReE(res, { message: `flat not found given id` }, httpStatus.BAD_REQUEST);
    }

    if (plot) {
        if (!plot._id) {
            return ReE(res, { message: "when update plot then plot _id is required" }, httpStatus.BAD_REQUEST);
        }

        if (!mongoose.isValidObjectId(plot._id)) {
            return ReE(res, { message: "plot _id is invalid" }, httpStatus.BAD_REQUEST);
        }

        let checkAlreadyExist = await Plot.findOne({ _id: plot._id });
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!checkAlreadyExist) return ReE(res, { message: `plot not found given id` }, httpStatus.BAD_REQUEST);
    }

    if (general) {
        let updateGeneral;
        [err, updateGeneral] = await toAwait(General.updateOne({ _id: general._id }, general));
        if (err) {
            errors.push(`error in while updating general: ${err.message}`);
        }
        results.general = updateGeneral;
        results.message = "general updated successfully";
    }

    if (billing) {
        let updateBilling;
        [err, updateBilling] = await toAwait(Billing.updateOne({ _id: billing._id }, billing));
        if (err) {
            errors.push(`error in while updating billing: ${err.message}`);
        }
        results.billing = updateBilling;
        results.message = "billing updated successfully";
    }

    if (plot) {
        let updatePlot;
        [err, updatePlot] = await toAwait(Plot.updateOne({ _id: plot._id }, plot));
        if (err) {
            errors.push(`error in while updating plot: ${err.message}`);
        }
        results.plot = updatePlot;
        results.message = "plot updated successfully";
    }

    if (flat) {
        let updateFlat;
        [err, updateFlat] = await toAwait(Flat.updateOne({ _id: flat._id }, flat));
        if (err) {
            errors.push(`error in while updating flat: ${err.message}`);
        }
        results.flat = updateFlat;
        results.message = "flat updated successfully";
    }


    if (errors.length > 0) return ReE(res, { message: errors }, httpStatus.BAD_REQUEST);

    return ReS(res, { message: "updated successfully" }, httpStatus.OK);

};

export const getAllGeneral = async (req: Request, res: Response) => {
    let getGeneral;
    let err;
    [err, getGeneral] = await toAwait(General.find({}).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getGeneral = getGeneral as IGeneral[]
    if (getGeneral.length === 0) {
        return ReE(res, { message: "general not found in db" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getGeneral }, httpStatus.OK);
};

export const getAllBilling = async (req: Request, res: Response) => {
    let getBilling;
    let err;
    [err, getBilling] = await toAwait(Billing.find({}).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getBilling = getBilling as IBilling[]
    if (getBilling.length === 0) {
        return ReE(res, { message: "billing not found in db" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getBilling }, httpStatus.OK);
};

export const getAllPlot = async (req: Request, res: Response) => {
    let getPlot;
    let err;
    [err, getPlot] = await toAwait(Plot.find({}).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getPlot = getPlot as IPlot[]
    if (getPlot.length === 0) {
        return ReE(res, { message: "plot not found in db" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getPlot }, httpStatus.OK);
};

export const getAllFlat = async (req: Request, res: Response) => {
    let getFlat;
    let err;
    [err, getFlat] = await toAwait(Flat.find({}).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    getFlat = getFlat as IFlat[]
    if (getFlat.length === 0) {
        return ReE(res, { message: "flat not found in db" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getFlat }, httpStatus.OK);
};

export const getByIdGeneral = async (req: Request, res: Response) => {
    let getGeneral;
    let { id } = req.params
    let err;
    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: "invalid id passed in params" }, httpStatus.BAD_REQUEST)
    }
    [err, getGeneral] = await toAwait(General.findById(id).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getGeneral) {
        return ReE(res, { message: "general not found given id" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getGeneral }, httpStatus.OK);
}

export const getByIdBilling = async (req: Request, res: Response) => {
    let getBilling;
    let { id } = req.params
    let err;
    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: "invalid id passed in params" }, httpStatus.BAD_REQUEST)
    }
    [err, getBilling] = await toAwait(Billing.findById(id).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getBilling) {
        return ReE(res, { message: "billing not found given id" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getBilling }, httpStatus.OK);
}

export const getByIdPlot = async (req: Request, res: Response) => {
    let getPlot;
    let { id } = req.params
    let err;
    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: "invalid id passed in params" }, httpStatus.BAD_REQUEST)
    }
    [err, getPlot] = await toAwait(Plot.findById(id).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getPlot) {
        return ReE(res, { message: "plot not found given id" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getPlot }, httpStatus.OK);
}

export const getByIdFlat = async (req: Request, res: Response) => {
    let getFlat;
    let { id } = req.params
    let err;
    if (!mongoose.isValidObjectId(id)) {
        return ReE(res, { message: "invalid id passed in params" }, httpStatus.BAD_REQUEST)
    }
    [err, getFlat] = await toAwait(Flat.findById(id).populate("customer"));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!getFlat) {
        return ReE(res, { message: "flat not found given id" }, httpStatus.NOT_FOUND)
    }
    return ReS(res, { data: getFlat }, httpStatus.OK);
}
