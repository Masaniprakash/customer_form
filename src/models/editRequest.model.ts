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
    },
    { timestamps: true }
);

export default mongoose.model<IEditRequest>("EditRequest", EditRequestSchema);
