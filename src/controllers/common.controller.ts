import { Request, Response } from "express";
import { General } from "../models/general.model";
import { Plot } from "../models/plot.model";
import { Emi } from "../models/emi.model";
import { isNull, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Customer } from "../models/customer.model";
import { Billing } from "../models/billing.model";
import { Flat } from "../models/flat.model";
import mongoose from "mongoose";
import { IGeneral } from "../type/general";
import { IPlot } from "../type/plot";
import { IBilling } from "../type/billing";
import { IFlat } from "../type/flat";

export const commonCreate = async (req: Request, res: Response) => {

    try {
        let body = req.body;
        const { marketerName, paymentTerms, emiAmount, noOfInstallments, status, loan, offered, editDeleteReason, customerId } = body;
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const saleDeedDoc = req.files && (req.files as any)["saleDeedDoc"]
            ? `${baseUrl}/${(req.files as any)["saleDeedDoc"][0].path.replace(/\\/g, "/")}`
            : undefined;
        const motherDoc = req.files && (req.files as any)["motherDoc"]
            ? `${baseUrl}/${(req.files as any)["motherDoc"][0].path.replace(/\\/g, "/")}`
            : undefined;
        const general = await General.create({
            marketerName,
            paymentTerms,
            emiAmount,
            noOfInstallments,
            status: status.toLowerCase(),
            loan,
            offered,
            editDeleteReason,
            customerId,
            saleDeedDoc,
            motherDoc,
        });

        return res.status(201).json({ success: true, data: general });
    } catch (err: any) {
        return res.status(500).json({ success: false, message: err.message });
    }

}

export const createCommonData = async (req: Request, res: Response) => {
    let body = req.body, err;
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

    let fields = ["customerId", "general", "plot", "billing", "flat"];
    let inVaildFields = fields.filter(x => isNull(body[x]));
    if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
    }

    const results: any = {};
    const errors: any[] = [];

    const tryCreate = async (model: any, data: any, key: string) => {
        try {
            results[key] = await model.create({ ...data, customer: customerId });
        } catch (err: any) {
            errors.push({ [key]: err.message });
        }
    };

    if (general.status) {
        general.status = general.status.toLowerCase();
        let validValue = ["enquired", "blocked", "vacant"]
        if (!validValue.includes(general.status)) {
            return ReE(res, { message: `general status value is invalid valid value are (${validValue})` }, httpStatus.BAD_REQUEST);
        }
        general.status = general.status === "enquired" ? "Enquired" : general.status === "blocked" ? "Blocked" : "Vacant";
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

    }

    if (general) {
        let checkAlreadyExist = await General.findOne(general);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkAlreadyExist) return ReE(res, { message: `general already exist based on given all details` }, httpStatus.BAD_REQUEST);
        await tryCreate(General, general, "general");
    }

    if (billing) {
        let checkAlreadyExist = await Billing.findOne(billing);
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (checkAlreadyExist) return ReE(res, { message: `billing already exist based on given all details` }, httpStatus.BAD_REQUEST);
        await tryCreate(Billing, billing, "billing");
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

export const uploadImages = (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/general`;

    let result: any;

    if (req.body.mapping) {
        let mapping: Record<string, string>[];
        try {
            mapping = JSON.parse(req.body.mapping);
        } catch (e) {
            return res.status(400).json({ message: "Invalid mapping format" });
        }

        result = mapping.map((item, index) => {
            const key = Object.keys(item)[0];
            return {
                [key]: files[index] ? `${baseUrl}/${files[index].filename}` : null,
            };
        });
    } else {
        result = files.map((file) => `${baseUrl}/${file.filename}`);
    }

    return res.status(200).json({ images: result });
};
