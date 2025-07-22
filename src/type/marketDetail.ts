import { Types } from 'mongoose';

export interface IMarketDetail {
  headBy: Types.ObjectId; // Reference to MarketingHead
  phone: string;
  address: string;
  status: string;
}
