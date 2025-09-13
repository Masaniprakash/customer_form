import mongoose, { Schema, Document } from "mongoose";

export interface IFlat extends Document {
    customer: Schema.Types.ObjectId;
    flat: string;
    block: string;
    floor: string;
    bedRoom: number;
    udsSqft: number;
    guideRateSqft: number;
    propertyTax: number;
    carPark: string;

    onBookingPercent: number;
    lintelPercent: number;
    roofPercent: number;
    plasterPercent: number;
    flooringPercent: number;

    landValue: number;
    landRegValue: number;
    constCost: number;
    constRegValue: number;
    carParkCost: number;
    ebDeposit: number;
    paymentTerm: string;
    sewageWaterTax: number;
    gst: number;
    corpusFund: number;
    additionalCharges: number;
    totalValue: number;
}