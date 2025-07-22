import mongoose, { Schema, Document } from 'mongoose';
import { IMarketDetail } from '../type/marketDetail';

const MarketDetailSchema: Schema = new Schema(
    {
        headBy: { type: Schema.Types.ObjectId, ref: 'MarketingHead', required: true }, // 👈 Reference
        phone: { type: String, required: true },
        address: { type: String, required: true },
        status: { type: String, default: 'active' },
    },
    {
        timestamps: true
    }
);

export const MarketDetail = mongoose.model<IMarketDetail>('MarketDetail', MarketDetailSchema);
