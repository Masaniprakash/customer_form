import mongoose, { Schema } from "mongoose";

const modSchema = new mongoose.Schema({
  date: {
    type: String
  },
  siteName: {
    type: String
  },
  plotNo: {
    type: String
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  introducerName: {
    type: String
  },
  introducerPhone: {
    type: String
  },
  directorName: {
    type: String
  },
  directorPhone: {
    type: String
  },
  EDName: {
    type: String
  },
  EDPhone: {
    type: String
  },
  amount: {
    type: Number
  },
  status: {
    type: String,
    default: "active"
  },
}, { timestamps: true });

export const Mod =  mongoose.model('Mod', modSchema); 