import mongoose from "mongoose";

export interface IEditRequest extends Document {
  _id: mongoose.Types.ObjectId;
  targetModel: string;   // e.g. "Billing", "Customer", "Emi"
  targetId: mongoose.Types.ObjectId; // document being edited
  editedBy: mongoose.Types.ObjectId; // employee user
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  createrChanges:{
    field: string;
    value: any;
  }[];
  status: "pending" | "approved" | "rejected";
  approvedBy?: mongoose.Types.ObjectId;
  secondaryId?: mongoose.Types.ObjectId;
  deletedId?: mongoose.Types.ObjectId;
  deletedTableName?: string;
  createrId: mongoose.Types.ObjectId;
  createrTableName: string;
  createdAt: Date;
  updatedAt: Date;
}