import { Request, Response } from "express";
import { General } from "../models/general.model";
import { Plot } from "../models/plot.model";
import { Emi } from "../models/emi.model";

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

export const createCustomerData = async (req: Request, res: Response) => {
    let body = req.body;
    // const { customerId, general, plot, emi, marketer, flat } = body;

    // if (!customerId) {
    //     return res.status(400).json({ success: false, message: "customerId is required" });
    // }

    const results: any = {};
    const errors: any[] = [];

    const tryCreate = async (model: any, data: any, key: string) => {
        try {
            results[key] = await model.create({ ...data });
        } catch (err: any) {
            errors.push({ [key]: err.message });
        }
    };

    const { marketerName, paymentTerms, emiAmount, noOfInstallments, status, loan, offered, editDeleteReason } = body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const saleDeedDoc = req.files && (req.files as any)["saleDeedDoc"]
        ? `${baseUrl}/${(req.files as any)["saleDeedDoc"][0].path.replace(/\\/g, "/")}`
        : undefined;
    const motherDoc = req.files && (req.files as any)["motherDoc"]
        ? `${baseUrl}/${(req.files as any)["motherDoc"][0].path.replace(/\\/g, "/")}`
        : undefined;
    const generalDoc = {
        marketerName,
        paymentTerms,
        emiAmount,
        noOfInstallments,
        status: status.toLowerCase(),
        loan,
        offered,
        editDeleteReason,
        // customerId,
        saleDeedDoc,
        motherDoc,
    }

    if (generalDoc) await tryCreate(General, generalDoc, "general");
    // if (plot) await tryCreate(Plot, plot, "plot");
    // if (emi) await tryCreate(Emi, emi, "emi");
    // if (marketer) await tryCreate(Marketer, marketer, "marketer");
    // if (flat) await tryCreate(Flat, flat, "flat");

    return res.status(201).json({
        success: errors.length === 0,
        message: errors.length === 0 ? "All records created successfully" : "Some records failed",
        data: results,
        errors,
    });
};
