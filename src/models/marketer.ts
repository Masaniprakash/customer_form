import { model, Schema } from "mongoose";
import { Types } from "mongoose";

const MarketerSchema = new Schema(
  {
    customer: { type: Types.ObjectId, ref: "Customer"},
    emiNo: { type: Number},
    paidDate: { type: Date },
    paidAmt: { type: Number },
    marketer: { type: String},
    commPercentage: { type: Number },
    commAmount: { type: Number },
    emiId: { type: Types.ObjectId, ref: "Emi" },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

export const Marketer = model("Marketer", MarketerSchema);
