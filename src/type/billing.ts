import mongoose, { Schema, Document } from "mongoose";

export interface IBilling extends Document {
    mobileNo: string;
    customer: mongoose.Types.ObjectId;
    transactionType: "EMI Receipt" | "Other";
    customerName: string;
    billingId: string; // e.g., 6735:2-Sep
    balanceAmount: number;
    modeOfPayment: "cash" | "card" | "online";
    cardNo?: string;
    cardHolderName?: string;
    paymentDate: Date;
    emiNo: number;
    amountPaid: number;
    saleType: "plot" | "flat" | "villa";
    introducer: mongoose.Types.ObjectId;
    status: "enquiry" | "blocked" | "active";
    remarks?: string;
    editDeleteReason?: string;
}