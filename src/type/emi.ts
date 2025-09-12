
export interface IEmi {
    customer: string;
    emiNo: number;
    date: Date;
    emiAmt: number;
    paidDate?: Date;
    paidAmt?: number;
    jpd?: string;
    createdAt?: Date;
    updatedAt?: Date;
}