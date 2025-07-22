import mongoose from "mongoose";

const marketingHeadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String,  required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'active' },
}, { timestamps: true });

export const MarketingHead = mongoose.model("MarketingHead", marketingHeadSchema);
