import mongoose from "mongoose";

const lfcSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.String,
    ref: "Customer", // reference to another model
  },
  conversion: {
    type: Boolean,
    required: true
  },
  registration: {
    type: String,
    required: true
  },
  needMod: {
    type: Boolean,
    required: true
  },
  landDetails: {
    sayFe: { type: String },
    sayTask: { type: String },
    plotNo: { type: String }
  },
  totalPayments: {
    payout: { type: Number, default: 0 },
    fustral: { type: Number, default: 0 },
    ent: { type: Number, default: 0 }
  },
  introductionName: {
    type: String
  },
  pl: {
    type: String
  }
}, { timestamps: true });

export const Lfc = mongoose.model("Lfc", lfcSchema);
