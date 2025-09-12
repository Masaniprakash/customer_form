import { Types } from "mongoose";

export interface IMarketer {
  emiNo: number;
  paidDate?: Date;
  paidAmt?: number;
  marketerName: string;
  commPercentage?: number;
  commAmount?: number;
  emiId?: Types.ObjectId;
}