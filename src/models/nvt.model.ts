import mongoose, { Mongoose, Schema } from "mongoose";

const nvtSchema = new mongoose.Schema({
  initPayment: { type: Number, required: true },
  totalPayment: { type: Number, required: true },
  emi: { type: Number, required: true },
  phone: { type: String, required: true },
  introducerName: { type: String, required: true },
  needMod: { type: Boolean, default: false },
  conversion: { type: Boolean, default: false },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true }
}, { timestamps: true });

export const Nvt = mongoose.model("Nvt", nvtSchema);