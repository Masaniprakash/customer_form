import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  phone: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    // required: true,
  },
  imageUrl: {
    type: String
  },
  role:{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  isAdmin:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
