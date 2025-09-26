import { Types } from 'mongoose';

export default interface IMarketer {
    customer: Types.ObjectId,
    emiNo: Number;
    paidDate: Date;
    paidAmt: Number;
    marketer: String;
    commPercentage: Number;
    commAmount: Number;
    emiId: Types.ObjectId;
    generalId: Types.ObjectId;
    marketerHeadId: Types.ObjectId;
    percentageId: Types.ObjectId;
}