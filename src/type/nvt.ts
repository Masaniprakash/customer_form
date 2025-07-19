export interface INVT {
  id?: string; // UUID
  mod: boolean;
  conversion: string;
  initialPayment: number;
  emi: number;
  totalPayment: number;
  introducer: string;
  phoneNumber: string;
  customerId: string;
  name: string;
}
