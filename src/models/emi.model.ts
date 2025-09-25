import mongoose, { model, Schema } from "mongoose";
import { IEmi } from "../type/emi";

const EmiSchema = new Schema({
    customer: {
        type: mongoose.Schema.Types.String,
        ref: "Customer",
    },
    general: {
        type: mongoose.Schema.Types.String,
        ref: "General",
    },
    emiNo: { type: Number },
    date: { type: Date },
    emiAmt: { type: Number },
    paidDate: { type: Date },
    paidAmt: { type: Number },
    jpd: { type: String },
},{ timestamps: true });

export const Emi = model("Emi", EmiSchema);