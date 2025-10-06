import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Customer } from "../models/customer.model";
import { ICustomer } from "../type/customer";
import mongoose from "mongoose";
import EditRequest from "../models/editRequest.model";
import { IUser } from "../type/user";
import CustomRequest from "../type/customRequest";
import { IEditRequest } from "../type/editRequest";

export const createCustomer = async (req: Request, res: Response) => {
  let body = req.body, err;
  let { duration, emiAmount, paymentTerms, marketerName, email, pincode, state, city, phone, address, name, marketatName } = body;
  // let fields = ["duration", "emiAmount", "paymentTerms", "marketerName", "email", "pincode", "state", "city", "phone", "address", "customerId", "name", 'marketatName'];
  // let inVaildFields = fields.filter(x => isNull(body[x]));
  // if (inVaildFields.length > 0) {
  //     return ReE(res, { message: `Please enter required fields ${inVaildFields}!.` }, httpStatus.BAD_REQUEST);
  // }
  if (email) {
    email = email.trim().toLowerCase();
    let findEmail;
    [err, findEmail] = await toAwait(Customer.findOne({ email: email }));
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (findEmail) {
      return ReE(res, { message: `Email already exists!.` }, httpStatus.BAD_REQUEST);
    }
  }
  if (phone) {
    if (!isPhone(phone)) {
      return ReE(res, { message: `Invalid phone number!.` }, httpStatus.BAD_REQUEST)
    }
    let findPhone;
    [err, findPhone] = await toAwait(Customer.findOne({ phone: phone }))
    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (findPhone) {
      return ReE(res, { message: `Phone already exists!.` }, httpStatus.BAD_REQUEST)
    }
  }
  let customer;
  [err, customer] = await toAwait(Customer.create(body));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!customer) {
    return ReE(res, { message: `Failed to create customer!.` }, httpStatus.INTERNAL_SERVER_ERROR)
  }
  ReS(res, { message: `customer added successfull` }, httpStatus.CREATED);
};

export const updateCustomer = async (req: CustomRequest, res: Response) => {
  const body = req.body, user = req.user as IUser;
  const { _id } = body;
  let err: any;

  if (!_id) {
    return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
  }

  if (!mongoose.isValidObjectId(_id)) {
    return ReE(res, { message: `Invalid customer _id!` }, httpStatus.BAD_REQUEST);
  }

  let getCustomer;
  [err, getCustomer] = await toAwait(Customer.findOne({ _id: _id }));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!getCustomer) {
    return ReE(res, { message: `customer not found for given id!.` }, httpStatus.NOT_FOUND)
  }

  const allowedFields = [
    "duration",
    "emiAmount",
    "paymentTerms",
    "marketerName",
    "email",
    "pincode",
    "state",
    "city",
    "phone",
    "address",
    "name",
    "marketatName"
  ];

  const updateFields: Record<string, any> = {};
  for (const key of allowedFields) {
    if (!isNull(body[key])) {
      updateFields[key] = body[key];
    }
  }

  if (updateFields.email) {
    updateFields.email = updateFields.email.trim().toLowerCase();
    const [emailErr, existingEmail] = await toAwait(
      Customer.findOne({ email: updateFields.email, _id: { $ne: _id } })
    );
    if (emailErr) return ReE(res, emailErr, httpStatus.INTERNAL_SERVER_ERROR);
    if (existingEmail) {
      return ReE(res, { message: `Email already exists!` }, httpStatus.BAD_REQUEST);
    }
  }

  if (updateFields.phone) {
    if (!isPhone(updateFields.phone)) {
      return ReE(res, { message: `Invalid phone number!` }, httpStatus.BAD_REQUEST);
    }
    const [phoneErr, existingPhone] = await toAwait(
      Customer.findOne({ phone: updateFields.phone, _id: { $ne: _id } }))
    if (phoneErr) return ReE(res, phoneErr, httpStatus.INTERNAL_SERVER_ERROR);
    if (existingPhone) {
      return ReE(res, { message: `Phone already exists!` }, httpStatus.BAD_REQUEST);
    }
  }

  if (user.isAdmin === false) {

    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    allowedFields.forEach((key: any) => {
      const newValue = body[key];
      const oldValue = (getCustomer as any)[key];
      if (isNull(newValue)) return
      if (newValue.toString() !== oldValue.toString()) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    if (changes.length === 0) {
      return ReE(res, { message: "No changes found to update." }, httpStatus.BAD_REQUEST);
    }

    let checkEditRequest;
    [err, checkEditRequest] = await toAwait(
      EditRequest.findOne({ targetId: _id, editedBy: user._id })
    )

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
    if (checkEditRequest) {
      checkEditRequest = checkEditRequest as IEditRequest;
      let get = []
      checkEditRequest.changes.forEach((change) => {
        if (changes.some((c) => c.field.toString() === change.field.toString())) {
          get.push(change)
        }
      })
      if (checkEditRequest.changes.length === get.length && checkEditRequest.status === "pending") {
        return ReE(res, { message: "You already have a pending edit request for this marketDetail." }, httpStatus.BAD_REQUEST);
      }
    }

    let createReq;
    [err, createReq] = await toAwait(
      EditRequest.create({
        targetModel: "Customer",
        targetId: _id,
        editedBy: user._id,
        changes,
        status: "pending",
      })
    );

    if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);

    return ReS(res, { message: "Edit request created successfully, Awaiting for approval." }, httpStatus.OK);

  } else {


    const [updateErr, updateResult] = await toAwait(
      Customer.updateOne({ _id }, { $set: updateFields })
    );
    if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
    return ReS(res, { message: "Customer updated successfully." }, httpStatus.OK);

  }

};

export const getByIdCustomer = async (req: Request, res: Response) => {
  let err, { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ReE(res, { message: `Invalid customer id!` }, httpStatus.BAD_REQUEST);
  }

  let getCustomer;
  [err, getCustomer] = await toAwait(Customer.findOne({ _id: id }));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!getCustomer) {
    return ReE(res, { message: `customer not found for given id!.` }, httpStatus.NOT_FOUND)
  }

  ReS(res, { message: "customer found", data: getCustomer }, httpStatus.OK)
}

export const getAllCustomer = async (req: Request, res: Response) => {
  let err, getCustomer;
  [err, getCustomer] = await toAwait(Customer.find());

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  getCustomer = getCustomer as ICustomer[]
  if (getCustomer.length === 0) {
    return ReE(res, { message: `customer not found!.` }, httpStatus.NOT_FOUND)
  }

  ReS(res, { message: "customer found", data: getCustomer }, httpStatus.OK)
}

export const deleteCustomer = async (req: Request, res: Response) => {
  let err, { _id } = req.body;
  if (!_id) {
    return ReE(res, { message: `Customer _id is required!` }, httpStatus.BAD_REQUEST);
  }
  if (!mongoose.isValidObjectId(_id)) {
    return ReE(res, { message: `Invalid customer id!` }, httpStatus.BAD_REQUEST);
  }

  let checkUser;
  [err, checkUser] = await toAwait(Customer.findOne({ _id: _id }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!checkUser) {
    return ReE(res, { message: `customer not found for given id!.` }, httpStatus.NOT_FOUND)
  }

  let deleteUser;
  [err, deleteUser] = await toAwait(Customer.deleteOne({ _id: _id }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
  ReS(res, { message: "customer deleted" }, httpStatus.OK)

}
