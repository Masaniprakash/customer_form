import { Types } from 'mongoose';

export interface IPercentage {
  headBy: Types.ObjectId; // Reference to MarketingHead
  name: string;
  rate: string;
}
