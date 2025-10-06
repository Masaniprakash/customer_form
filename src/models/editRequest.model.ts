import mongoose, { Schema } from "mongoose";
import { IEditRequest } from "../type/editRequest";

const EditRequestSchema: Schema = new Schema<IEditRequest>(
    {
        targetModel: { type: String, required: true },
        targetId: { type: Schema.Types.ObjectId, required: true },
        editedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        changes: [
            {
                field: { type: String, required: true },
                oldValue: Schema.Types.Mixed,
                newValue: Schema.Types.Mixed,
            },
        ],
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        secondaryId: { type: Schema.Types.ObjectId, ref: "EditRequest" },
        deletedId: { type: Schema.Types.ObjectId },
        deletedTableName: { type: String },
        createrId: { type: Schema.Types.ObjectId, ref: "EditRequest" },
        createrTableName: { type: String },
        createrChanges:[
            {
                field: { type: String, required: true },
                value: Schema.Types.Mixed,
            },
        ]
    },
    { timestamps: true }
);

export default mongoose.model<IEditRequest>("EditRequest", EditRequestSchema);
