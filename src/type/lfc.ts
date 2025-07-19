export interface ILFC {
  id?: string; // UUID
  customer_id: string; // UUID
  conversion: boolean;
  conversionCustomerId: string;
  registration: string;
  needMod: boolean;
  landDetails: {
    sayFe: string;
    sayTask: string;
    plotNo: string;
  };
  totalPayments: {
    payout: number;
    fustral: number;
    ent: number;
  };
  introductionName: string;
  pl: string;
  customerId: string;
  customerName: string;
}
