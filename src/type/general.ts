import mongoose from "mongoose";

export interface IGeneral {
    _id?:  mongoose.Types.ObjectId;
    customer:  mongoose.Types.ObjectId;
    marketer:  mongoose.Types.ObjectId;
    marketerName: string;
    saleDeedDoc?: string;
    paymentTerms?: string;
    emiAmount?: number;
    noOfInstallments?: number;
    motherDoc?: string;
    status: "enquired" | "blocked" | "vacant";
    loan?: boolean;
    offered?: boolean;
    editDeleteReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}