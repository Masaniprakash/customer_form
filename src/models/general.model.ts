import mongoose, { model, Schema } from "mongoose";

const GeneralSchema = new Schema({
    customer: {
        type: mongoose.Schema.Types.String,
        ref: "Customer",
    },
    marketerName: {
        type: String,
    },
    saleDeedDoc: {
        type: String
    },
    paymentTerms: {
        type: String
    },
    emiAmount: {
        type: Number
    },
    noOfInstallments: {
        type: Number
    },
    motherDoc: {
        type: String
    },
    status: {
        type: String,
        enum: ["enquired", "blocked", "vacant"],
        required: true,
    },
    loan: {
        type: String
    },
    offered: {
        type: String
    },
    editDeleteReason: {
        type: String
    },
}, { timestamps: true });

export const General = model("General", GeneralSchema);