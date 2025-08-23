import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  status: {
    type: String,
    // required: true,
  }
}, { timestamps: true });

export const Menu = mongoose.model("Menu", menuSchema);
