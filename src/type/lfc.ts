import { Types } from "mongoose";

export interface ILFC {
  _id?: string;
  customer: string;
  introductionName: string;
  emi: number;
  inital: number;
  totalSqFt: string;
  sqFtAmount: string;
  plotNo: string;
  registration: string;
  conversion: boolean;
  needMod: boolean;
  mod: Types.ObjectId;
  project: Types.ObjectId;
  nvt: Types.ObjectId[] | string[]; 
}

