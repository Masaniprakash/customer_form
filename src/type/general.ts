export interface IGeneral {
    customer: string;
    marketerName: string;
    saleDeedDoc?: string;
    paymentTerms?: string;
    emiAmount?: number;
    noOfInstallments?: number;
    motherDoc?: string;
    status: "enquired" | "blocked" | "vacant";
    loan?: boolean;
    offered?: boolean;
    editDeleteReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
}