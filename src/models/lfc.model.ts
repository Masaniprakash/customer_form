import mongoose from "mongoose";

const lfcSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.String,
    ref: "Customer",
  },
  introductionName: {
    type: String
  },
  emi: { type: Number, default: 0 },
  inital: { type: Number, default: 0 },
  totalSqFt: { type: String },
  sqFtAmount: { type: String },
  plotNo: { type: String },
  registration: {
    type: String,
    required: true
  },
  conversion: {
    type: Boolean,
    required: true
  },
  needMod: {
    type: Boolean,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },
  mod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mod"
  },
  nvt: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Nvt"
    }
  ]
}, { timestamps: true });

export const Lfc = mongoose.model("Lfc", lfcSchema);
