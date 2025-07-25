import { Request, Response } from "express";
import { isEmpty, isNull, isPhone, isValidDate, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Lfc } from "../models/lfc.model";
import { ILFC } from "../type/lfc";
import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { IMOD } from "../type/mod";
import { Mod } from "../models/mod.model";
import { Nvt } from "../models/nvt.model";

export const createLfc = async (req: Request, res: Response) => {
  let body = req.body, err;
  let { mod, lfc } = body
  if (!lfc) {
    return ReE(res, "lfc is required", httpStatus.BAD_REQUEST);
  }
  let { customer, introductionName, emi, inital, totalSqFt, sqFtAmount, plotNo, registration, conversion, needMod, nvt } = lfc;
  let fields = ["customer", "introductionName", "emi", "inital", "totalSqFt", "sqFtAmount", "plotNo", "registration", "conversion", "needMod", "nvt"];
  let inVaildFields = fields.filter(x => isNull(lfc[x]));
  if (inVaildFields.length > 0) {
    return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
  }
  if (typeof needMod !== 'boolean') {
    return ReE(res, "needMod must be boolean", httpStatus.BAD_REQUEST);
  }
  if (!Array.isArray(nvt)) {
    return ReE(res, "nvt must be array", httpStatus.BAD_REQUEST);
  }
  if (nvt.length === 0) {
    return ReE(res, "Please select at least one nvt", httpStatus.BAD_REQUEST);
  }
  for (let index = 0; index < nvt.length; index++) {
    const element = nvt[index];
    if (!mongoose.isValidObjectId(element)) {
      return ReE(res, "nvt invalid id : " + element, httpStatus.BAD_REQUEST);
    }
    let checkNvt;
    [err, checkNvt] = await toAwait(Nvt.findById(element));
    if (err) {
      return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!checkNvt) {
      return ReE(res, "nvt not found given id: " + element, httpStatus.NOT_FOUND);
    }
  }
  if (!customer) {
    return ReE(res, { message: `Please enter customer id!.` }, httpStatus.BAD_REQUEST)
  }
  if (!mongoose.isValidObjectId(customer)) {
    return ReE(res, { message: 'Invalid customer id!' }, httpStatus.BAD_REQUEST);
  }
  if (typeof conversion !== 'boolean') {
    return ReE(res, "lfc.conversion must be boolean", httpStatus.BAD_REQUEST);
  }
  let findExist;
  [err, findExist] = await toAwait(Customer.findById({ _id: customer }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!findExist) {
    return ReE(res, { message: `customer is not found given id: ${customer}!.` }, httpStatus.NOT_FOUND);
  }
  let createMod: any;
  if (needMod === true) {
    if (!mod) {
      return ReE(res, "mod is required", httpStatus.BAD_REQUEST);
    }
    let { date, siteName, plotNo, introducerPhone, introducerName, directorName, directorPhone, EDName, EDPhone, amount, status } = mod;
    let fields = ["date", "siteName", "plotNo", "introducerPhone", "introducerName", "directorName", "directorPhone", "EDName", "EDPhone", "amount", "status"];
    let inVaildFields = fields.filter(x => isNull(mod[x]));
    if (inVaildFields.length > 0) {
      return ReE(res, { message: `Please enter required fields ${inVaildFields}! for mod create.` }, httpStatus.BAD_REQUEST);
    }
    if (!isValidDate(date)) {
      return ReE(res, { message: `Invalid date, valid format is (YYYY-MM-DD)!.` }, httpStatus.BAD_REQUEST);
    }
    [err, createMod] = await toAwait(Mod.create({ ...mod, introducerName, customer }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!createMod) {
      return ReE(res, { message: `Failed to create mod!.` }, httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  let createlfc;
  let obj = lfc;
  if (needMod) {
    obj = { ...obj, mod: createMod._id }
  }
  [err, createlfc] = await toAwait(Lfc.create(obj));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!createlfc) {
    return ReE(res, { message: `Failed to create lfc!.` }, httpStatus.INTERNAL_SERVER_ERROR)
  }
  ReS(res, { message: `lfc added successfull` }, httpStatus.CREATED);
};

export const updateLfc = async (req: Request, res: Response) => {
  const body = req.body;
  let err: any;
  let { mod, lfc } = body
  if (!lfc) {
    return ReE(res, "lfc is required", httpStatus.BAD_REQUEST);
  }
  if (!lfc._id) {
    return ReE(res, "lfc._id is required", httpStatus.BAD_REQUEST);
  }
  let checkLfc;
  [err, checkLfc] = await toAwait(Lfc.findById(lfc._id));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!checkLfc) {
    return ReE(res, { message: `lfc not found!.` }, httpStatus.NOT_FOUND);
  }
  checkLfc = checkLfc as ILFC;
  let { customer, introductionName, emi, inital, totalSqFt, sqFtAmount, plotNo, registration, conversion, needMod, nvt } = lfc;
  let fields = ["customer", "introductionName", "emi", "inital", "totalSqFt", "sqFtAmount", "plotNo", "registration", "conversion", "needMod", "nvt"];
  let modFields = ["date", "siteName", "plotNo", "introducerName", "introducerPhone", "directorName", "directorPhone", "EDName", "EDPhone", "amount", "status"];
  let inVaildFields = fields.filter(x => !isNull(lfc[x]));
  if (inVaildFields.length === 0) {
    return ReE(res, { message: `Please enter any one fields to update ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
  }
  if (needMod) {
    if (typeof needMod !== 'boolean') {
      return ReE(res, "needMod must be boolean", httpStatus.BAD_REQUEST);
    }
  }
  if (nvt) {
    if (!Array.isArray(nvt)) {
      return ReE(res, "nvt must be array", httpStatus.BAD_REQUEST);
    }
    if (nvt.length === 0) {
      return ReE(res, "Please select at least one nvt", httpStatus.BAD_REQUEST);
    }
    for (let index = 0; index < nvt.length; index++) {
      const element = nvt[index];
      if (!mongoose.isValidObjectId(element)) {
        return ReE(res, "nvt invalid id : " + element, httpStatus.BAD_REQUEST);
      }
      let checkNvt;
      [err, checkNvt] = await toAwait(Nvt.findById(element));
      if (err) {
        return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
      }
      if (!checkNvt) {
        return ReE(res, "nvt not found given id: " + element, httpStatus.NOT_FOUND);
      }
    }
  }
  if (customer) {
    if (!customer) {
      return ReE(res, { message: `Please enter customer id!.` }, httpStatus.BAD_REQUEST)
    }
    if (!mongoose.isValidObjectId(customer)) {
      return ReE(res, { message: 'Invalid customer id!' }, httpStatus.BAD_REQUEST);
    }
    let findExist;
    [err, findExist] = await toAwait(Customer.findById({ _id: customer }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!findExist) {
      return ReE(res, { message: `customer is not found given id: ${customer}!.` }, httpStatus.NOT_FOUND);
    }
  }
  if (conversion) {
    if (typeof conversion !== 'boolean') {
      return ReE(res, "lfc.conversion must be boolean", httpStatus.BAD_REQUEST);
    }
  }
  let createMod: any;
  if (needMod === true || checkLfc.needMod === true) {
    if (needMod === true && checkLfc.needMod !== true) {
      if (!mod) {
        return ReE(res, "mod is required", httpStatus.BAD_REQUEST);
      }
      let { date, siteName, plotNo, introducerPhone, directorName, introducerName, directorPhone, EDName, EDPhone, amount, status } = mod;
      let inVaildFields = modFields.filter(x => isNull(mod[x]));
      if (inVaildFields.length > 0) {
        return ReE(res, { message: `Please enter required fields ${inVaildFields}! for mod create.` }, httpStatus.BAD_REQUEST);
      }
      if (!isValidDate(date)) {
        return ReE(res, { message: `Invalid date, valid format is (YYYY-MM-DD)!.` }, httpStatus.BAD_REQUEST);
      }
      [err, createMod] = await toAwait(Mod.create({ ...mod, customer: customer ?? checkLfc.customer }))
      if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
      if (!createMod) {
        return ReE(res, { message: `Failed to create mod!.` }, httpStatus.INTERNAL_SERVER_ERROR);
      }
    } else if (checkLfc.needMod === true && !isEmpty(mod)) {
      const updateFields: Record<string, any> = {};
      for (const key of modFields) {
        if (!isNull(mod[key])) {
          updateFields[key] = mod[key];
        }
      }
      if (!isEmpty(updateFields)) {
        [err, createMod] = await toAwait(Mod.updateOne({ _id: checkLfc.mod }, { $set: updateFields }));
        if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
        if (!createMod) {
          return ReE(res, { message: `Failed to update mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
        }
      }
    }
  }
  let updateFields: Record<string, any> = {};
  for (const key of fields) {
    if (!isNull(lfc[key])) {
      updateFields[key] = lfc[key];
    }
  }
  if (needMod === true) {
    updateFields = { ...updateFields, mod: createMod?._id }
  }
  if (needMod === false && checkLfc.needMod === true) {
    updateFields = { ...updateFields, mod: null }
  }

  if (!isEmpty(updateFields)) {
    [err, createMod] = await toAwait(Lfc.updateOne({ _id: lfc._id }, { $set: updateFields }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!createMod) {
      return ReE(res, { message: `Failed to update mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }

    if (needMod === false && checkLfc.needMod === true) {
      let removeMod;
      [err, removeMod] = await toAwait(Mod.deleteOne({ _id: checkLfc.mod }));
      if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
      if (!removeMod) {
        return ReE(res, { message: `Failed to remove mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
      }
    }
  }
  ReS(res, { message: `lfc updated successfull` }, httpStatus.OK);
};

export const getByIdLfc = async (req: Request, res: Response) => {
  let err, { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ReE(res, { message: `Invalid lfc id!` }, httpStatus.BAD_REQUEST);
  }

  let getLfc;
  [err, getLfc] = await toAwait(Lfc.findOne({ _id: id }).populate("customer").populate("mod").populate({
    path: "nvt",
    populate: {
      path: "mod"
    }
  }));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!getLfc) {
    return ReE(res, { message: `lfc not found for given id!.` }, httpStatus.NOT_FOUND)
  }

  ReS(res, { message: "lfc found", data: getLfc }, httpStatus.OK)
}

export const getAllLfc = async (req: Request, res: Response) => {
  let err, getLfc;
  [err, getLfc] = await toAwait(Lfc.find().populate("customer").populate("mod").populate({
    path: "nvt",
    populate: {
      path: "mod"
    }
  }));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  getLfc = getLfc as ILFC[]
  if (getLfc.length === 0) {
    return ReE(res, { message: `lfc not found!.` }, httpStatus.NOT_FOUND)
  }

  ReS(res, { message: "lfc found", data: getLfc }, httpStatus.OK)
}

export const deleteLfc = async (req: Request, res: Response) => {
  let err, { _id } = req.body;
  if (!_id) {
    return ReE(res, { message: `Lfc _id is required!` }, httpStatus.BAD_REQUEST);
  }
  if (!mongoose.isValidObjectId(_id)) {
    return ReE(res, { message: `Invalid lfc id!` }, httpStatus.BAD_REQUEST);
  }

  let checkLfc: any;
  [err, checkLfc] = await toAwait(Lfc.findOne({ _id: _id }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!checkLfc) {
    return ReE(res, { message: `lfc not found for given id!.` }, httpStatus.NOT_FOUND)
  }
  if (checkLfc.mod) {
    let removeMod;
    [err, removeMod] = await toAwait(Mod.deleteOne({ _id: checkLfc.mod }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!removeMod) {
      return ReE(res, { message: `Failed to remove mod!.` }, httpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  let deleteLfc;
  [err, deleteLfc] = await toAwait(Lfc.deleteOne({ _id: _id }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
  ReS(res, { message: "lfc deleted" }, httpStatus.OK)

}