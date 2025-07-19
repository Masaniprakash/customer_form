import { Request, Response } from "express";
import mongoose from "mongoose";
import { Lfc } from "../models/lfc.model";
import { Customer } from "../models/customer.model";
import httpStatus from "http-status";
import { ReS, ReE, toAwait, isNull } from "../services/util.service";
import { ILFC } from "../type/lfc";

export const createLfc = async (req: Request, res: Response) => {
  const body = req.body;
  let err, customerCheck;

  const { customerId } = body;
  if(customerId){
    if (!customerId || !mongoose.isValidObjectId(customerId)) {
      return ReE(res, { message: "Valid customerId is required!" }, httpStatus.BAD_REQUEST);
    }
  
    [err, customerCheck] = await toAwait(Customer.findById(customerId));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!customerCheck) return ReE(res, { message: "Customer not found for given customerId!" }, httpStatus.NOT_FOUND);
  }

  let newLfc;
  [err, newLfc] = await toAwait(Lfc.create(body));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

  return ReS(res, { message: "Lfc created successfully", data: newLfc }, httpStatus.CREATED);
};

export const getAllLfc = async (_req: Request, res: Response) => {
  let err, data;
  [err, data] = await toAwait(Lfc.find().populate("customerId"));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  data = data as ILFC[];
  if (!data || data.length === 0) {
    return ReE(res, { message: "No Lfc found!" }, httpStatus.NOT_FOUND);
  }
  return ReS(res, { message: "Lfcs fetched", data }, httpStatus.OK);
};

export const getLfcById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return ReE(res, { message: "Invalid Lfc ID" }, httpStatus.BAD_REQUEST);
  }

  let err, lfc;
  [err, lfc] = await toAwait(Lfc.findById(id).populate("customerId"));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!lfc) return ReE(res, { message: "Lfc not found!" }, httpStatus.NOT_FOUND);

  return ReS(res, { message: "Lfc found", data: lfc }, httpStatus.OK);
};

export const updateLfc = async (req: Request, res: Response) => {
  const { _id, ...updates } = req.body;

  if (!_id || !mongoose.isValidObjectId(_id)) {
    return ReE(res, { message: "_id is required and must be valid" }, httpStatus.BAD_REQUEST);
  }

  let err, existing;
  [err, existing] = await toAwait(Lfc.findById(_id));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!existing) return ReE(res, { message: "Lfc not found" }, httpStatus.NOT_FOUND);

  if(req.body.customerId){
    let customerCheck;
    [err, customerCheck] = await toAwait(Customer.findById(req.body.customerId));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (!customerCheck) return ReE(res, { message: "Customer not found given customerId" }, httpStatus.NOT_FOUND);
  }

  const [updateErr] = await toAwait(Lfc.updateOne({ _id }, { $set: updates }));
  if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR);

  return ReS(res, { message: "Lfc updated successfully" }, httpStatus.OK);
};

export const deleteLfc = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return ReE(res, { message: "Invalid ID" }, httpStatus.BAD_REQUEST);
  }

  let err, deleted;
  [err, deleted] = await toAwait(Lfc.findByIdAndDelete(id));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!deleted) return ReE(res, { message: "Lfc not found for given id" }, httpStatus.NOT_FOUND);

  return ReS(res, { message: "Lfc deleted successfully" }, httpStatus.OK);
};
