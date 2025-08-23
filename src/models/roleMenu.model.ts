import mongoose from "mongoose";

const roleMenuSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Types.ObjectId,
    ref: "Role"
  },
  menuId: {
    type: mongoose.Types.ObjectId,
    ref: "Menu"
  },
  read: {
    type: Boolean,
    default: false
  },
  create: {
    type: Boolean,
    default: false
  },
  update: {
    type: Boolean,
    default: false
  },
  delete: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    // required: true,
  }
}, { timestamps: true });

export const RoleMenu = mongoose.model("RoleMenu", roleMenuSchema);
