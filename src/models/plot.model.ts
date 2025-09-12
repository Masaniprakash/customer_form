import mongoose, { model, Schema } from "mongoose";
import { IPlot } from "../type/plot";

const PlotSchema = new Schema<IPlot>({
    customer: {
        type: mongoose.Schema.Types.String,
        ref: "Customer",
    },
    guideRatePerSqFt: {
        type: Number
    },
    guideLandValue: {
        type: Number
    },
    landValue: {
        type: Number
    },
    regValue: {
        type: Number
    },
    additionalCharges: {
        type: Number
    },
    totalValue: {
        type: Number
    },
}, { timestamps: true });

export const Plot = model<IPlot>("Plot", PlotSchema);