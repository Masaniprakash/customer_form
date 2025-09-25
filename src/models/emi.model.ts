import mongoose, { model, Schema } from "mongoose";
import { IEmi } from "../type/emi";

const EmiSchema = new Schema<IEmi>({
    customer: {
        type: mongoose.Schema.Types.String,
        ref: "Customer",
    },
    emiNo: { type: Number },
    date: { type: Date },
    emiAmt: { type: Number },
    paidDate: { type: Date },
    paidAmt: { type: Number },
    jpd: { type: String },
},{ timestamps: true });

export const Emi = model<IEmi>("Emi", EmiSchema);