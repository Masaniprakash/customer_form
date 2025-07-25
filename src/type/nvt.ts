export interface INVT {
  id?: string; // UUID
  needMod: boolean;
  conversion: string;
  initialPayment: number;
  totalPayment: number;
  emi: number;
  introducerName: string;
  customer: string;
  mod: string
}