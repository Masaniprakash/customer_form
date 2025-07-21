import { Request, Response } from "express";
import { isNull, isPhone, isValidUUID, IsValidUUIDV4, ReE, ReS, toAwait } from "../services/util.service";
import httpStatus from "http-status";
import { Project } from "../models/project.model";
import { IProject } from "../type/project";
import mongoose from "mongoose";

export const createProject = async (req: Request, res: Response) => {
  let body = req.body, err;
  let {  projectName,  description,  shortName,  duration,  emiAmount,  marketer,  schema,  returns,  intrest,  totalInvestimate,  totalReturnAmount } = body;
  let checkProject;
  [err,checkProject] = await toAwait(Project.findOne(body))
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (checkProject) return ReE(res, { message: "Project already exist for given all data" }, httpStatus.BAD_REQUEST);
  let project;
  [err, project] = await toAwait(Project.create(body));
  console.log(body);
  console.log(err);
  
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!project) {
    return ReE(res, { message: `Failed to create project!.` }, httpStatus.INTERNAL_SERVER_ERROR)
  }
  ReS(res, { message: `project added successfull` }, httpStatus.CREATED);
};

export const updateProject = async (req: Request, res: Response) => {
  const body = req.body;
  const { _id } = body;
  let err: any;

  if (!_id) {
    return ReE(res, { message: `_id is required!` }, httpStatus.BAD_REQUEST);
  }

  if (!mongoose.isValidObjectId(_id)) {
    return ReE(res, { message: `Invalid project _id!` }, httpStatus.BAD_REQUEST);
  }

  let getProject;
  [err, getProject] = await toAwait(Project.findOne({ _id: _id }));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!getProject) {
    return ReE(res, { message: `project not found   for given id!.` }, httpStatus.NOT_FOUND)
  }

  const allowedFields = [
    "projectName",  "description",  "shortName",  "duration",  "emiAmount",  "marketer",  "schema",  "returns",  "intrest",  "totalInvestimate",  "totalReturnAmount"
  ];

  const updateFields: Record<string, any> = {};
  for (const key of allowedFields) {
    if (!isNull(body[key])) {
      updateFields[key] = body[key];
    }
  }

  const [updateErr, updateResult] = await toAwait(
    Project.updateOne({ _id }, { $set: updateFields })
  );
  if (updateErr) return ReE(res, updateErr, httpStatus.INTERNAL_SERVER_ERROR)
  if (!updateResult) {
    return ReE(res, { message: `Failed to update project!.` }, httpStatus.INTERNAL_SERVER_ERROR)
  }
  return ReS(res, { message: "Project updated successfully." }, httpStatus.OK);
};

export const getByIdProject = async (req: Request, res: Response) => {
  let err, { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return ReE(res, { message: `Invalid project id!` }, httpStatus.BAD_REQUEST);
  }

  let getProject;
  [err, getProject] = await toAwait(Project.findOne({ _id: id }));

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!getProject) {
    return ReE(res, { message: `project not found for given id!.` }, httpStatus.NOT_FOUND)
  }

  ReS(res, { message: "project found", data: getProject }, httpStatus.OK)
}

export const getAllProject = async (req: Request, res: Response) => {
  let err, getProject;
  [err, getProject] = await toAwait(Project.find());

  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  getProject = getProject as IProject[]
  if (getProject.length === 0) {
    return ReE(res, { message: `project not found!.` }, httpStatus.NOT_FOUND)
  }

  ReS(res, { message: "project found", data: getProject }, httpStatus.OK)
}


export const deleteProject = async (req: Request, res: Response) => {
  let err, { _id } = req.body;
  if(!_id){
    return ReE(res, { message: `Project _id is required!` }, httpStatus.BAD_REQUEST);
  }
  if (!mongoose.isValidObjectId(_id)) {
    return ReE(res, { message: `Invalid project id!` }, httpStatus.BAD_REQUEST);
  }

  let checkUser;
  [err, checkUser] = await toAwait(Project.findOne({ _id: _id }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR);
  if (!checkUser) {
    return ReE(res, { message: `project not found for given id!.` }, httpStatus.NOT_FOUND)
  }

  let deleteUser;
  [err, deleteUser] = await toAwait(Project.deleteOne({ _id: _id }));
  if (err) return ReE(res, err, httpStatus.INTERNAL_SERVER_ERROR)
  ReS(res, { message: "project deleted" }, httpStatus.OK)

}