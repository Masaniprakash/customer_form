import mongoose, { Schema } from "mongoose";

const nvtSchema = new mongoose.Schema({
  initialPayment: { type: Number, required: true },
  totalPayment: { type: Number, required: true },
  emi: { type: Number, required: true },
  introducerName: { type: String, required: true },
  needMod: { type: Boolean, default: false },
  conversion: { type: Boolean, default: false },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  mod:{
    type: Schema.Types.ObjectId,
    ref: 'Mod'
  }
}, { timestamps: true });

export const Nvt = mongoose.model("Nvt", nvtSchema);