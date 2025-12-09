declare module 'flutterwave-node-v3' {
  export interface PaymentPayload {
    tx_ref: string;
    amount: number;
    currency: string;
    redirect_url: string;
    meta?: Record<string, any>;
    customer?: {
      email: string;
      name?: string;
      phone_number?: string;
    };
    customizations?: {
      title?: string;
      description?: string;
      logo?: string;
    };
  }

  export interface PaymentResponse {
    status: string;
    message: string;
    data?: {
      link: string;
      reference?: string;
      [key: string]: any;
    };
  }

  export interface TransactionVerifyPayload {
    flw_ref?: string;
    tx_ref?: string;
    transaction_id?: string;
  }

  export interface TransactionResponse {
    status: string;
    message: string;
    data?: {
      [key: string]: any;
    };
  }

  export class Flutterwave {
    Payment: PaymentService;
    Transaction: TransactionService;
    constructor(secret_key: string, public_key?: string);
  }

  export interface PaymentService {
    initiate(data: PaymentPayload): Promise<PaymentResponse>;
  }

  export interface TransactionService {
    verify(data: TransactionVerifyPayload): Promise<TransactionResponse>;
  }
}
